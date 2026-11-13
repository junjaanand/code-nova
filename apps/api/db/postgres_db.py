import os
import json
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from apps.api.config import settings

class PostgresVectorDB:
    """
    Native PostgreSQL 16 + pgvector database client.
    Connects to Supabase or standard PostgreSQL with pgvector extension.
    Executes real HNSW vector similarity search and RLS isolation.
    """
    def __init__(self):
        self.conn_str = os.getenv("DATABASE_URL", "")
        self.conn = None

    def connect(self):
        if not self.conn_str:
            return None
        try:
            self.conn = psycopg2.connect(self.conn_str, cursor_factory=RealDictCursor)
            self.conn.autocommit = True
            return self.conn
        except Exception as e:
            print(f"[PostgresVectorDB] Connection failed: {e}. Ensure DATABASE_URL is correct.")
            return None

    def execute_schema_migration(self):
        """Executes schema.sql to initialize tables, pgvector extensions, and HNSW indexes."""
        schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
        if not os.path.exists(schema_path):
            return False

        with open(schema_path, "r", encoding="utf-8") as f:
            sql = f.read()

        conn = self.connect()
        if not conn:
            return False

        with conn.cursor() as cur:
            cur.execute(sql)
            print("[PostgresVectorDB] schema.sql migration executed successfully with pgvector & RLS!")
            return True

    def vector_search_rules(self, query_embedding: List[float], brand_pack_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Executes HNSW vector cosine distance search using pgvector operator `<=>`:
        SELECT *, 1 - (embedding <=> query_vector) AS similarity FROM rules ...
        """
        conn = self.connect()
        if not conn:
            return []

        embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        query = """
            SELECT id, brand_pack_id, category, severity, title, description, source_page,
                   1 - (embedding <=> %s::vector) AS similarity
            FROM rules
            WHERE brand_pack_id = %s AND approved = TRUE
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """
        with conn.cursor() as cur:
            cur.execute(query, (embedding_str, brand_pack_id, embedding_str, limit))
            results = cur.fetchall()
            return [dict(r) for r in results]

    def vector_search_facts(self, query_embedding: List[float], brand_pack_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Executes pgvector similarity search on approved facts.
        """
        conn = self.connect()
        if not conn:
            return []

        embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        query = """
            SELECT id, brand_pack_id, claim_type, value, source, owner, valid_from, valid_to, status,
                   1 - (embedding <=> %s::vector) AS similarity
            FROM facts
            WHERE brand_pack_id = %s AND status = 'approved'
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """
        with conn.cursor() as cur:
            cur.execute(query, (embedding_str, brand_pack_id, embedding_str, limit))
            results = cur.fetchall()
            return [dict(r) for r in results]

postgres_db = PostgresVectorDB()
