import sqlite3
import json

def exportar_dados_para_json():
    # 1. CONEXÃO / CRIAÇÃO DO BANCO DE DADOS LOCAL (mangas.db)
    conn = sqlite3.connect('mangas.db')
    cursor = conn.cursor()

    # 2. CRIAÇÃO DA ESTRUTURA DA TABELA (produtos_mangás)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS produtos_mangás (
            ID TEXT PRIMARY KEY,
            Título TEXT,
            Categoria TEXT,
            image_url TEXT, 
            Volumes TEXT,
            Lançamento TEXT
        )
    ''')
    
    # 3. DADOS DE TESTE (7 mangás baseados nos seus dados do Supabase)
    dados_teste = [
        ('80', 'Mashle', 'Manga', 'https://via.placeholder.com/192x256?text=Mashle', '18', '2020-2023'),
        ('2435', 'Solo Leveling', 'Manhwa', 'https://via.placeholder.com/192x256?text=Solo+Leveling', '14', '2018-2021'),
        ('2456', 'Jujutsu Kaisen', 'Manga', 'https://via.placeholder.com/192x256?text=Jujutsu+Kaisen', '26', '2018-Atual'),
        ('5092', 'Kimetsu no Yaiba', 'Manga', 'https://via.placeholder.com/192x256?text=Kimetsu+no+Yaiba', '23', '2016-2020'),
        ('5883', 'Dr. Stone', 'Sci-Fi', 'https://via.placeholder.com/192x256?text=Dr.+Stone', '26', '2017-2022'),
        ('7131', 'Chainsaw Man', 'Manga', 'https://via.placeholder.com/192x256?text=Chainsaw+Man', '16', '2018-Atual'),
        ('8371', 'Naruto', 'Manga', 'https://via.placeholder.com/192x256?text=Naruto', '72', '1999-2014'),
    ]
    
    cursor.executemany("INSERT OR IGNORE INTO produtos_mangás VALUES (?, ?, ?, ?, ?, ?)", dados_teste)
    conn.commit()

    # 4. EXPORTAÇÃO: Puxa os dados do SQLite e os prepara para JSON
    cursor.execute("SELECT ID, Título, Categoria, image_url, Volumes, Lançamento FROM produtos_mangás")
    
    colunas = [coluna[0] for coluna in cursor.description]
    dados_json = [
        dict(zip(colunas, linha))
        for linha in cursor.fetchall()
    ]
    conn.close()

    # 5. SALVA O ARQUIVO data.json
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(dados_json, f, ensure_ascii=False, indent=4)

exportar_dados_para_json()
print("Sucesso! Arquivos 'mangas.db' e 'data.json' criados na sua pasta.")