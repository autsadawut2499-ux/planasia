-- Allow large blueprint / permit PDF sets (up to 100MB).
update storage.buckets
set file_size_limit = 104857600 -- 100 MiB
where id = 'site-assets';
