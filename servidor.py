import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_FILE = "adega_caixa.db"

def init_db():
    """Cria as tabelas se não existirem e define a senha padrão inicial (1234)"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Tabela de Vendas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT,
            hora TEXT,
            tipo TEXT,
            produtos TEXT,
            total REAL
        )
    """)
    
    # 2. Tabela de Configurações (Para armazenar a senha)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS configuracoes (
            chave TEXT PRIMARY KEY,
            valor TEXT
        )
    """)
    
    # Se for a primeira vez rodando, insere a senha padrão '1234'
    cursor.execute("SELECT valor FROM configuracoes WHERE chave = 'senha_mestra'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO configuracoes (chave, valor) VALUES ('senha_mestra', '1234')")
        
    conn.commit()
    conn.close()

def obter_senha_atual():
    """Busca a senha que está gravada no banco de dados SQLite"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT valor FROM configuracoes WHERE chave = 'senha_mestra'")
    linha = cursor.fetchone()
    conn.close()
    return linha[0] if linha else "1234"

@app.route('/api/vendas', methods=['POST'])
def salvar_venda():
    """RECEBER PEDIDO DO CARDÁPIO: O cliente envia sem precisar de senha"""
    dados = request.json
    if not dados: return jsonify({"erro": "Dados inválidos"}), 400

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO vendas (data, hora, tipo, produtos, total) VALUES (?, ?, ?, ?, ?)
    """, (dados['data'], dados['hora'], dados['tipo'], dados['produtos'], dados['total']))
    conn.commit()
    conn.close()
    return jsonify({"status": "sucesso", "mensagem": "Pedido gravado com sucesso!"}), 201

@app.route('/api/relatorio', methods=['GET'])
def buscar_relatorio():
    """CARREGAR RELATÓRIO: Exige a senha guardada no banco"""
    token = request.headers.get("Authorization")
    if token != obter_senha_atual():
        return jsonify({"erro": "Acesso Negado! Senha incorreta."}), 403

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, data, hora, tipo, produtos, total FROM vendas")
    linhas = cursor.fetchall()
    conn.close()

    vendas = [{"id": l[0], "data": l[1], "hora": l[2], "tipo": l[3], "produtos": l[4], "total": l[5]} for l in linhas]
    return jsonify(vendas)

@app.route('/api/alterar-senha', methods=['PUT'])
def alterar_senha():
    """ALTERAR SENHA: Valida a senha antiga e grava a nova no SQLite"""
    dados = request.json
    senha_atual_fornecida = request.headers.get("Authorization")
    
    if senha_atual_fornecida != obter_senha_atual():
        return jsonify({"erro": "Acesso Negado! Senha atual incorreta."}), 403
        
    nova_senha = dados.get("nova_senha")
    if not nova_senha or len(nova_senha.strip()) < 3:
        return jsonify({"erro": "A nova senha deve ter pelo menos 3 caracteres."}), 400

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE configuracoes SET valor = ? WHERE chave = 'senha_mestra'", (nova_senha.strip(),))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "sucesso", "mensagem": "Senha mestra alterada com sucesso!"})

@app.route('/api/limpar', methods=['DELETE'])
def limpar_banco():
    """LIMPAR CAIXA: O ZAP do Clipper"""
    token = request.headers.get("Authorization")
    if token != obter_senha_atual():
        return jsonify({"erro": "Acesso Negado! Senha incorreta."}), 403

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vendas")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='vendas'")
    conn.commit()
    conn.close()
    return jsonify({"status": "sucesso", "mensagem": "O banco de dados foi ZERADO com sucesso!"})

if __name__ == '__main__':
    init_db()
    print("🚀 Servidor da Adega com Senha Dinâmica rodando na porta 5000!")
    app.run(port=5000, debug=True)