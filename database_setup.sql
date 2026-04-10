-- 1. Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    age INTEGER,
    position TEXT,
    height INTEGER,
    weight INTEGER,
    picture_url TEXT
);

-- 2. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL
);

-- 3. Enable RLS and setup permissive policies to allow Anon key access
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read for students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert for students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update for students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete for students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read for attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert for attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update for attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete for attendance" ON public.attendance FOR DELETE USING (true);

-- 4. Setup Storage Bucket for student pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('students', 'students', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public bucket
CREATE POLICY "Public read image" ON storage.objects FOR SELECT USING (bucket_id = 'students');
CREATE POLICY "Allow anonymous upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'students');
CREATE POLICY "Allow anonymous update" ON storage.objects FOR UPDATE USING (bucket_id = 'students');
CREATE POLICY "Allow anonymous delete" ON storage.objects FOR DELETE USING (bucket_id = 'students');
