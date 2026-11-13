import os
import sys

# Ensure workspace root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from apps.api.db.postgres_db import postgres_db
from apps.api.db.seed_data import seed_database
from apps.api.services.embedding_service import embedding_service
from apps.api.db.database import db

def run_migration():
    print("=" * 60)
    print("🐘 BrandShield AI — PostgreSQL 16 + pgvector Migration")
    print("=" * 60)

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("⚠️ No DATABASE_URL found in environment or .env.")
        print("To connect to real Supabase PostgreSQL:")
        print("1. Create a free project at https://supabase.com")
        print("2. Copy your Connection string (URI) to .env as DATABASE_URL=postgresql://...")
        print("3. Re-run: python -m apps.api.db.migrate")
        return False

    print(f"Connecting to database: {db_url.split('@')[-1] if '@' in db_url else 'PostgreSQL'}...")
    conn = postgres_db.connect()
    if not conn:
        print("❌ Could not connect to PostgreSQL. Check your credentials.")
        return False

    # Execute schema
    print("Applying schema.sql with pgvector, HNSW indexes & RLS...")
    success = postgres_db.execute_schema_migration()
    if not success:
        print("❌ Migration failed.")
        return False

    # Seed initial rules and facts with 768-dim vector embeddings
    print("Seeding rules and facts with pgvector embeddings...")
    seed_database()

    with conn.cursor() as cur:
        for r in db.rules.values():
            emb = embedding_service.generate_embedding(r.title + " " + r.description)
            emb_str = "[" + ",".join(map(str, emb)) + "]"
            cur.execute("""
                INSERT INTO rules (id, brand_pack_id, category, severity, title, description, source_page, embedding, approved)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector, %s)
                ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding;
            """, (r.id, r.brand_pack_id, r.category.value, r.severity.value, r.title, r.description, r.source_page, emb_str, r.approved))

        for f in db.facts.values():
            emb = embedding_service.generate_embedding(f.claim_type.value + " " + f.value)
            emb_str = "[" + ",".join(map(str, emb)) + "]"
            cur.execute("""
                INSERT INTO facts (id, brand_pack_id, claim_type, value, source, owner, valid_from, valid_to, status, embedding)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector)
                ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding;
            """, (f.id, f.brand_pack_id, f.claim_type.value, f.value, f.source, f.owner, f.valid_from, f.valid_to, f.status.value, emb_str))

    print("✅ Migration & pgvector embedding seeding completed successfully!")
    return True

if __name__ == "__main__":
    run_migration()
