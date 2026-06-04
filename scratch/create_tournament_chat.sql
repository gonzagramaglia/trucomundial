-- SQL Script para crear la tabla de chat de torneos
-- Ejecutar en el panel de SQL Editor en Supabase

CREATE TABLE IF NOT EXISTS tournament_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tournament_messages ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Cualquiera puede leer los mensajes
CREATE POLICY "Public profiles can view tournament messages."
    ON tournament_messages FOR SELECT
    USING (true);

-- Política de escritura: Usuarios autenticados pueden enviar mensajes
CREATE POLICY "Authenticated users can insert tournament messages."
    ON tournament_messages FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Activar Realtime para esta tabla (si no está activado a nivel base de datos)
-- Es necesario ir al dashboard de Supabase: Database -> Replication -> Seleccionar 'tournament_messages'
-- O alternativamente usar el comando SQL si el public schema publication existe:
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_messages;

-- RECARGAR CACHÉ DE SUPABASE (POSTGREST) PARA QUE LA API RECONOZCA LA TABLA AL INSTANTE
NOTIFY pgrst, 'reload schema';
