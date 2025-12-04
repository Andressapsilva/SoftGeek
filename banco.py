import sqlite3
import csv

# Caminhos
CSV_PATH = "SoftGeek Mangás.csv"       # Seu arquivo CSV
DB_PATH = "mangas.db"         # Seu banco SQLite

# 🔹 1. Conectar ao banco
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# 🔹 2. Criar tabela (se não existir)
cur.execute("""
CREATE TABLE IF NOT EXISTS mangas (
    id INTEGER PRIMARY KEY,
    titulo TEXT,
    categoria TEXT,
    preco REAL,
    imagem TEXT
)
""")

print("Tabela verificada/criada com sucesso.")

# 3. Importar o CSV
with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    next(reader)   # pular header

    for row in reader:
        # AJUSTE DA SOLUÇÃO: Fatiamento para usar apenas os 5 primeiros elementos
        # Isso resolve o erro de "Incorrect number of bindings supplied"
        dados_para_inserir = row[:5]
        
        cur.execute("""
            INSERT OR REPLACE INTO mangas (id, titulo, categoria, preco, imagem)
            VALUES (?, ?, ?, ?, ?)
        """, dados_para_inserir)


# 🔹 4. Salvar
conn.commit()

# --- BLOCO DE VERIFICAÇÃO IMPLEMENTADO ---
try:
    # Usando o nome correto da tabela: 'mangas'
    NOME_DA_TABELA = 'mangas' 

    # Executar o comando SQL para contar as linhas
    cur.execute(f"SELECT COUNT(*) FROM {NOME_DA_TABELA}")

    # Obter o resultado (fetchone()[0] pega o valor da contagem)
    count = cur.fetchone()[0] 

    print("Importação concluída com sucesso!")
    print(f"VERIFICAÇÃO: A tabela '{NOME_DA_TABELA}' foi importada e contém {count} linhas de dados.")

except Exception as e:
    print(f"ERRO durante a verificação: {e}")

# 🔹 5. Encerrar
conn.close()