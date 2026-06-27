import sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Permite que o seu GitHub Pages ou arquivos locais conversem com o PC sem travar no CORS
CORS(app)

DB_NAME = "adega_caixa.db"


def inicializar_banco():
    """Cria o banco de dados e as tabelas se não existirem."""
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()

    # Tabela para salvar as vendas/pedidos
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT,
            hora TEXT,
            tipo TEXT,
            produtos TEXT,
            total REAL
        )
    """
    )

    # Tabela para salvar a senha mestra do proprietário
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS configuracao (
            chave TEXT PRIMARY KEY,
            valor TEXT
        )
    """
    )

    # Define a senha padrão '1234' caso o banco seja novo
    cursor.execute(
        "INSERT OR IGNORE INTO configuracao (chave, valor) VALUES ('senha_mestra', '1234')"
    )

    conexao.commit()
    conexao.close()


def obter_senha_banco():
    """Busca a senha atualizada direto do banco de dados."""
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    cursor.execute(
        "SELECT valor FROM configuracao WHERE chave = 'senha_mestra'"
    )
    resultado = cursor.fetchone()
    conexao.close()
    return resultado[0] if resultado else "1234"


@app.route("/api/relatorio", methods=["GET"])
def relatorio():
    senha_recebida = request.headers.get("Authorization")
    senha_correta = obter_senha_banco()

    if not senha_recebida or senha_recebida.strip() != senha_correta.strip():
        print(f"[-] Tentativa de acesso negada. Senha incorreta ou vazia.")
        return jsonify({"erro": "Senha incorreta!"}), 403

    print("[+] Acesso liberado ao relatório.")

    try:
        conexao = sqlite3.connect(DB_NAME)
        cursor = conexao.cursor()
        cursor.execute(
            "SELECT id, data, hora, tipo, produtos, total FROM vendas"
        )
        linhas = cursor.fetchall()
        conexao.close()

        vendas_lista = []
        for linha in linhas:
            vendas_lista.append(
                {
                    "id": linha[0],
                    "data": linha[1],
                    "hora": linha[2],
                    "tipo": linha[3],
                    "produtos": linha[4],
                    "total": linha[5],
                }
            )

        return jsonify(vendas_lista), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/api/alterar-senha", methods=["PUT"])
def alterar_senha():
    dados = request.get_json()
    senha_recebida = request.headers.get("Authorization")
    senha_correta = obter_senha_banco()  # Corrigido aqui

    if not senha_recebida or senha_recebida.strip() != senha_correta.strip():
        return jsonify({"erro": "Não autorizado!"}), 403

    nova_senha = dados.get("nova_senha")
    if not nova_senha or len(nova_senha.strip()) < 3:
        return jsonify({"erro": "Senha inválida!"}), 400

    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    cursor.execute(
        "UPDATE configuracao SET valor = ? WHERE chave = 'senha_mestra'",
        (nova_senha.strip(),),
    )
    conexao.commit()
    conexao.close()

    print(f"[*] Senha mestra alterada com sucesso!")
    return jsonify({"mensagem": "Senha alterada com sucesso!"}), 200


@app.route("/api/limpar", methods=["DELETE"])
def limpar_caixa():
    senha_recebida = request.headers.get("Authorization")
    senha_correta = obter_senha_banco()  # Corrigido aqui

    if not senha_recebida or senha_recebida.strip() != senha_correta.strip():
        return jsonify({"erro": "Não autorizado!"}), 403

    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    cursor.execute("DELETE FROM vendas")
    conexao.commit()
    conexao.close()

    print("[!] O movimento de caixa foi zerado.")
    return jsonify({"mensagem": "Caixa zerado com sucesso!"}), 200


@app.route("/api/pedidos", methods=["POST"])
def receber_pedido():
    try:
        dados = request.get_json()
        print(f"[+] Novo pedido recebido no terminal: {dados}")

        tipo = dados.get("tipo", "Balcão")
        produtos = dados.get("produtos", "")
        total = dados.get("total", 0.0)

        agora = datetime.now()
        data_atual = agora.strftime("%d/%m/%Y")
        hora_atual = agora.strftime("%H:%M:%S")

        conexao = sqlite3.connect(DB_NAME)
        cursor = conexao.cursor()
        cursor.execute(
            """
            INSERT INTO vendas (data, hora, tipo, produtos, total)
            VALUES (?, ?, ?, ?, ?)
        """,
            (data_atual, hora_atual, tipo, produtos, total),
        )
        conexao.commit()
        conexao.close()

        return jsonify({"mensagem": "Pedido gravado no banco com sucesso!"}), 201
    except Exception as e:
        print(f"[-] Erro ao salvar pedido: {str(e)}")
        return jsonify({"erro": str(e)}), 500


if __name__ == "__main__":
    inicializar_banco()
    print("-" * 50)
    print("🚀 SERVIDOR DA ADEGA ATIVO LOCALMENTE")
    print("👉 Rota do Relatório: http://127.0.0.1:5000/api/relatorio")
    print("-" * 50)
    app.run(debug=True, port=5000)