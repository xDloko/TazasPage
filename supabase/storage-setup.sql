-- Supabase Storage Setup for Product Images
-- Run this in your Supabase SQL Editor

-- Create the 'productos' bucket (public)
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

-- Allow public read access to all files in 'productos' bucket
create policy "Public read access for productos bucket"
on storage.objects for select
using (bucket_id = 'productos');

-- Allow authenticated admin users to upload to 'productos' bucket
create policy "Admin insert for productos bucket"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'productos'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Allow authenticated admin users to update files in 'productos' bucket
create policy "Admin update for productos bucket"
on storage.objects for update
to authenticated
using (
  bucket_id = 'productos'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Allow authenticated admin users to delete files from 'productos' bucket
create policy "Admin delete for productos bucket"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'productos'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);
