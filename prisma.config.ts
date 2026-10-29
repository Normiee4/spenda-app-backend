import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import supabasePack from '@prisma/orm-extension-supabase/pack';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: './src/prisma/contract.prisma',
    extensions: [supabasePack],
    db: { connection: process.env['DIRECT_URL']! },
    migrations: { dir: './src/prisma/migrations' },
  }),
});
