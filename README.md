# 🍻 Cardápio Digital & Sistema de Retaguarda - Adega v2

Este é um sistema completo de cardápio digital interativo para adegas e comércios, integrado com envio automatizado de pedidos via WhatsApp e um servidor local para gerenciamento e relatório de vendas em banco de dados SQLite.

---

## 🚀 Funcionalidades

* **Cardápio Interativo:** Filtro por categorias de produtos e adição dinâmica de itens ao carrinho.
* **Controle de Mesas/Comanda Acumulativa:** Mantém o histórico do que já foi consumido na mesa e gerencia novas rodadas.
* **Fechamento Inteligente:** Opção de solicitar o encerramento da conta direto pelo painel.
* **Integração Dupla:** Envia o pedido formatado para o WhatsApp do estabelecimento e, simultaneamente, registra a venda no banco de dados local.
* **Painel de Relatório Seguro:** Tela de retaguarda para acompanhar o faturamento, zerar o caixa e alterar a senha mestra.

---

## 💻 Estrutura do Projeto

* `index.html` - Interface principal do cardápio digital apresentada ao cliente.
* `relatorio.html` - Painel de controle do proprietário para visualização de vendas.
* `js/script.js` - Lógica do carrinho, controle de comanda e envio dos dados (`POST` / `FETCH`).
* `css/style.css` - Estilização visual moderna e responsiva do cardápio.
* `servidor.py` - Servidor back-end em Python (Flask) que gerencia as requisições e segurança.
* `adega_caixa.db` - Banco de dados local SQLite (gerado automaticamente).

---

## 🔧 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter o **Python 3** instalado em sua máquina e a biblioteca Flask. Para instalar as dependências, execute no terminal:
```bash
pip install flask flask-cors
