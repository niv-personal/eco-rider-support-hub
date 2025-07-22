-- Create storage bucket for query attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true);

-- Create storage policies for attachment uploads
CREATE POLICY "Anyone can view attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated users can upload attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'attachments' AND auth.role() = 'authenticated');