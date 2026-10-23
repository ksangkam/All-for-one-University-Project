-- Apply after schema.sql. Adds pending owner applications and protects role changes.
create table if not exists public.owner_applications (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  shop_name text not null check (length(btrim(shop_name)) between 2 and 120),
  area text not null check (area in ('เขาใหญ่', 'วัดอรุณ', 'เยาวราช')),
  contact_info text not null check (length(btrim(contact_info)) between 3 and 200),
  description text not null default '' check (length(description) <= 600),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

alter table public.owner_applications enable row level security;
drop policy if exists "owner application read own" on public.owner_applications;
create policy "owner application read own" on public.owner_applications
  for select to authenticated using (profile_id = auth.uid());
grant select on public.owner_applications to authenticated;

create or replace function public.request_owner_application(
  p_shop_name text, p_area text, p_contact_info text, p_description text default ''
) returns public.owner_applications
language plpgsql security definer set search_path = public as $$
declare result public.owner_applications;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'renter') then
    raise exception 'Only renter accounts can request owner access';
  end if;
  insert into public.owner_applications(profile_id, shop_name, area, contact_info, description)
  values (auth.uid(), btrim(p_shop_name), p_area, btrim(p_contact_info), coalesce(p_description, ''))
  on conflict (profile_id) do update set
    shop_name = excluded.shop_name, area = excluded.area, contact_info = excluded.contact_info,
    description = excluded.description, status = 'pending', created_at = now(), reviewed_at = null, reviewed_by = null
  where public.owner_applications.status = 'rejected'
  returning * into result;
  if not found then raise exception 'An owner application is already pending or approved'; end if;
  return result;
end $$;
revoke all on function public.request_owner_application(text, text, text, text) from public, anon;
grant execute on function public.request_owner_application(text, text, text, text) to authenticated;

-- Browser users can update their profile but can never promote themselves.
create or replace function public.prevent_profile_role_change()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
    and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    raise exception 'Role changes require trusted provisioning';
  end if;
  return new;
end $$;

-- Sign-ups always create a renter profile. Owner metadata can only create a pending request.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare application jsonb;
begin
  insert into public.profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'renter');

  application := new.raw_user_meta_data->'owner_application';
  if jsonb_typeof(application) = 'object'
    and length(btrim(coalesce(application->>'shop_name', ''))) between 2 and 120
    and application->>'area' in ('เขาใหญ่', 'วัดอรุณ', 'เยาวราช')
    and length(btrim(coalesce(application->>'contact_info', ''))) between 3 and 200
    and length(coalesce(application->>'description', '')) <= 600 then
    insert into public.owner_applications(profile_id, shop_name, area, contact_info, description)
    values (new.id, btrim(application->>'shop_name'), application->>'area',
      btrim(application->>'contact_info'), coalesce(application->>'description', ''));
  end if;
  return new;
end $$;

-- Run from the Supabase SQL Editor (trusted postgres role) to approve one applicant.
-- Replace the email, then run both statements as one transaction. Shop is created on first dashboard visit.
-- begin;
-- update public.profiles set role = 'owner'
-- where id = (select id from auth.users where email = 'owner@example.com');
-- update public.owner_applications set status = 'approved', reviewed_at = now()
-- where profile_id = (select id from auth.users where email = 'owner@example.com') and status = 'pending';
-- commit;
