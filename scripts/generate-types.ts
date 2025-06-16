import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://unheayipydasaqjauaxt.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateTypes() {
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .not('table_name', 'like', '_prisma_%')

    if (error) throw error

    let typesContent = `// Generated types for Supabase tables
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
`

    for (const table of tables) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position')

      if (columnsError) throw columnsError

      typesContent += `      ${table.table_name}: {
        Row: {
`
      for (const column of columns) {
        const type = column.data_type === 'jsonb' ? 'Json' : 
                    column.data_type === 'timestamp with time zone' ? 'string' :
                    column.data_type === 'boolean' ? 'boolean' :
                    column.data_type === 'integer' ? 'number' :
                    'string'
        typesContent += `          ${column.column_name}: ${type}${column.is_nullable === 'YES' ? ' | null' : ''}\n`
      }
      typesContent += `        }
        Insert: {
`
      for (const column of columns) {
        if (column.column_name !== 'id' && column.column_name !== 'created_at') {
          const type = column.data_type === 'jsonb' ? 'Json' : 
                      column.data_type === 'timestamp with time zone' ? 'string' :
                      column.data_type === 'boolean' ? 'boolean' :
                      column.data_type === 'integer' ? 'number' :
                      'string'
          typesContent += `          ${column.column_name}?: ${type}${column.is_nullable === 'YES' ? ' | null' : ''}\n`
        }
      }
      typesContent += `        }
        Update: {
`
      for (const column of columns) {
        if (column.column_name !== 'created_at') {
          const type = column.data_type === 'jsonb' ? 'Json' : 
                      column.data_type === 'timestamp with time zone' ? 'string' :
                      column.data_type === 'boolean' ? 'boolean' :
                      column.data_type === 'integer' ? 'number' :
                      'string'
          typesContent += `          ${column.column_name}?: ${type}${column.is_nullable === 'YES' ? ' | null' : ''}\n`
        }
      }
      typesContent += `        }
      }\n`
    }

    typesContent += `    }
  }
}`

    const outputPath = path.join(process.cwd(), 'src', 'types', 'supabase.ts')
    fs.writeFileSync(outputPath, typesContent)
    console.log('Types generated successfully!')
  } catch (error) {
    console.error('Error generating types:', error)
    process.exit(1)
  }
}

generateTypes() 