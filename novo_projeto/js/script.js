// =======================================================
// 1. MAPEAMENTO SEGURO DE ELEMENTOS DO HTML
// =======================================================
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('open-cart-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartBadgeCount = document.getElementById('cart-badge-count');
const modalTotalValue = document.getElementById('modal-total-value');
const cartItemsContainer = document.getElementById('cart-items-container');
const addCartButtons = document.querySelectorAll('.btn-add-item');
const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
const orderLocationSelect = document.getElementById('order-location');

// Inicialização segura do carrinho (Previne quebras por memória corrompida)
let cart = [];
try {
    const savedCart = localStorage.getItem('adega_cart_data');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) cart = [];
    }
} catch (e) {
    console.warn("Aviso: Falha ao ler localStorage, iniciando carrinho vazio.");
    cart = [];
}

// =======================================================
// CONTROLE DE FILTROS DE CATEGORIAS (Se houver no HTML)
// =======================================================
const categoryButtons = document.querySelectorAll('.category-item');
const productItems = document.querySelectorAll('.product-item');

if (categoryButtons.length > 0 && productItems.length > 0) {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const categoriaSelecionada = button.getAttribute('data-category');

            productItems.forEach(item => {
                const categoriaProduto = item.getAttribute('data-category');
                if (categoriaSelecionada === 'todos' || categoriaSelecionada === categoriaProduto) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// =======================================================
// 2. CONTROLE DO MODAL (ABRIR E FECHAR A JANELA)
// =======================================================
if (openCartBtn && cartModal) {
    openCartBtn.addEventListener('click', () => cartModal.style.display = 'flex');
}
if (closeModalBtn && cartModal) {
    closeModalBtn.addEventListener('click', () => cartModal.style.display = 'none');
}

window.addEventListener('click', (event) => {
    if (cartModal && event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// =======================================================
// 3. ADICIONAR ITENS AO CARRINHO (Função principal)
// =======================================================
if (addCartButtons.length > 0) {
    addCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            if (name && !isNaN(price)) {
                addToCart(name, price);
            }
        });
    });
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name && item.enviado === false);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            enviado: false
        });
    }
    
    saveCartToStorage();
    updateCartLayout();
}

// =======================================================
// 4. ATUALIZAR O VISUAL DA JANELA DE PEDIDOS (CONTEÚDO)
// =======================================================
function updateCartLayout() {
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    let totalGeral = 0;
    let totalItensNovos = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-text">Nenhum pedido aberto nesta mesa.</p>';
        if (modalTotalValue) modalTotalValue.textContent = 'R$ 0,00';
        if (cartBadgeCount) cartBadgeCount.textContent = '0';
        
        const urlParams = new URLSearchParams(window.location.search);
        if (orderLocationSelect && !urlParams.get('mesa')) {
            orderLocationSelect.disabled = false;
            orderLocationSelect.style.backgroundColor = '';
            orderLocationSelect.style.color = '';
            orderLocationSelect.style.cursor = '';
        }
        return;
    }

    if (orderLocationSelect) {
        orderLocationSelect.disabled = true; 
        orderLocationSelect.style.backgroundColor = '#1d1d22';
        orderLocationSelect.style.color = '#8d8d99';
        orderLocationSelect.style.cursor = 'not-allowed';
    }

    const itensEnviados = cart.filter(item => item.enviado);
    const itensNovos = cart.filter(item => !item.enviado);

    if (itensEnviados.length > 0) {
        const blocoConsumo = document.createElement('div');
        blocoConsumo.style.cssText = "background-color: #1c1c1f; padding: 12px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ffb800;";
        
        let htmlConsumo = `<h4 style="color: #ffb800; margin: 0 0 10px 0; font-size: 0.9rem;"><i class="fas fa-receipt"></i> Já Consumido / Na Mesa</h4>`;
        let subtotalConsumido = 0;

        itensEnviados.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalGeral += itemTotal;
            subtotalConsumido += itemTotal;
            
            htmlConsumo += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.85rem; color: #8d8d99;">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });

        htmlConsumo += `
            <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px dashed #27272a; font-weight: bold; color: #fff; font-size: 0.85rem;">
                <span>Subtotal Consumido:</span>
                <span>R$ ${subtotalConsumido.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
        blocoConsumo.innerHTML = htmlConsumo;
        cartItemsContainer.appendChild(blocoConsumo);
    }

    if (itensNovos.length > 0) {
        const blocoNovos = document.createElement('div');
        blocoNovos.innerHTML = `<h4 style="color: #04d361; margin: 0 0 10px 0; font-size: 0.9rem;"><i class="fas fa-plus-circle"></i> Nova Rodada (A Enviar)</h4>`;
        cartItemsContainer.appendChild(blocoNovos);

        cart.forEach((item, index) => {
            if (item.enviado) return;

            const itemTotal = item.price * item.quantity;
            totalGeral += itemTotal;
            totalItensNovos += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                    <div>
                        <h4 style="color: #fff; font-size: 0.95rem;">${item.name}</h4>
                        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                            <button onclick="diminuirQtd(${index})" style="background-color: #27272a; color: #fff; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                            <span style="color: #fff; font-size: 0.9rem; font-weight: bold; min-width: 15px; text-align: center;">${item.quantity}</span>
                            <button onclick="aumentarQtd(${index})" style="background-color: #27272a; color: #fff; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="color: #04d361; font-weight: bold; font-size: 0.95rem;">
                            R$ ${itemTotal.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    if (itensEnviados.length > 0 && itensNovos.length === 0) {
        const avisoVazio = document.createElement('p');
        avisoVazio.style.cssText = "color: #8d8d99; font-size: 0.85rem; text-align: center; margin: 15px 0;";
        avisoVazio.textContent = "Escolha mais produtos no cardápio para pedir uma nova rodada.";
        cartItemsContainer.appendChild(avisoVazio);
    }

    if (modalTotalValue) modalTotalValue.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    if (cartBadgeCount) cartBadgeCount.textContent = totalItensNovos;
    
    if (sendWhatsappBtn) {
        if (itensNovos.length > 0) {
            sendWhatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Enviar Alteração / Nova Rodada';
            sendWhatsappBtn.style.backgroundColor = '#04d361';
            sendWhatsappBtn.style.color = '#ffffff';
        } else {
            sendWhatsappBtn.innerHTML = '<i class="fas fa-check-double"></i> Pedir para Fechar a Conta';
            sendWhatsappBtn.style.backgroundColor = '#ffb800';
            sendWhatsappBtn.style.color = '#0f0f12';
        }
    }
}

// =======================================================
// CONTROLE DE QUANTIDADE NO MODAL
// =======================================================
window.aumentarQtd = function(index) {
    if (!cart[index] || cart[index].enviado) return; 
    cart[index].quantity += 1;
    saveCartToStorage();
    updateCartLayout();
}

window.diminuirQtd = function(index) {
    if (!cart[index] || cart[index].enviado) return; 
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    saveCartToStorage();
    updateCartLayout();
}

function saveCartToStorage() {
    try {
        localStorage.setItem('adega_cart_data', JSON.stringify(cart));
    } catch(e) {}
}

// =======================================================
// 5. DISPARAR MENSAGEM DO WHATSAPP E INTEGRAR RELATÓRIO
// =======================================================
if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const localizacao = orderLocationSelect ? orderLocationSelect.value : 'mesa-geral';
        const numeroMesa = localizacao.replace('mesa-', '').toUpperCase();
        
        const novosItens = cart.filter(item => !item.enviado);
        let mensagem = "";
        
        // --- SEÇÃO INTERLIGADA COM O RELATÓRIO ---
        if (novosItens.length > 0) {
            // 1. Mapeia e junta a lista de strings dos produtos novos
            let listaProdutosString = novosItens.map(item => `${item.quantity}x ${item.name}`).join(' | ');
            let totalVendaRodada = novosItens.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            // 2. Cria a estrutura da venda para o Relatório
            // 2. Cria a estrutura da venda (Compatível com a tabela do SQLite)
            const novaVenda = {
                data: new Date().toLocaleDateString("pt-BR"),
                hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                tipo: localizacao.includes('delivery') ? 'Delivery' : `MESA ${numeroMesa}`,
                produtos: listaProdutosString,
                total: totalVendaRodada
            };

            // 3. PONTE COM O PYTHON: Envia os dados direto para o servidor local
            fetch("https://api-adega.onrender.com/api/vendas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(novaVenda)
            })
            .then(resposta => resposta.json())
            .then(dados => {
                console.log("Sucesso no banco Python:", dados.mensagem);
            })
            .catch(erro => {
                console.error("Erro ao conectar no servidor Python:", erro);
                alert("Aviso: O servidor Python não respondeu, mas o pedido seguirá para o WhatsApp.");
            });

            // 3. Salva no banco de dados do relatório
            let historicoVendas = JSON.parse(localStorage.getItem("bancoVendas")) || [];
            historicoVendas.push(novaVenda);
            localStorage.setItem("bancoVendas", JSON.stringify(historicoVendas));
            
            // 4. CONSTRUÇÃO DA MENSAGEM WHATSAPP
            mensagem = `*🔥 NOVO PEDIDO - MESA ${numeroMesa}* 🍻\n`;
            mensagem += `--------------------------------\n\n`;
            novosItens.forEach(item => {
                mensagem += `*${item.quantity}x* ${item.name}\n`;
            });
            mensagem += `\n--------------------------------\n`;
            mensagem += `_Total deste pedido: R$ ${totalVendaRodada.toFixed(2).replace('.', ',')}_`;
            
            // 5. REGRA DE FECHAMENTO INTELIGENTE (Mesa vs Delivery)
            if (localizacao.includes('delivery')) {
                // Se for Delivery, limpa tudo direto porque o cliente não vai pedir mais
                cart = []; 
            } else {
                // Se for MESA, não zera! Passa os itens para "enviado = true" (acumula na conta da mesa)
                cart.forEach(item => item.enviado = true);
                
                // Agrupa para não duplicar linhas visualmente no modal
                const comandaAgrupada = [];
                cart.forEach(item => {
                    const existente = comandaAgrupada.find(c => c.name === item.name && c.enviado === item.enviado);
                    if (existente) {
                        existente.quantity += item.quantity;
                    } else {
                        comandaAgrupada.push({...item});
                    }
                });
                cart = comandaAgrupada;
            }
            
        } else {
        
            // FECHAMENTO DA CONTA (Opcional registrar no relatório se não salvou antes)
            mensagem = `*💳 SOLICITAÇÃO DE FECHAMENTO - MESA ${numeroMesa}* 🔥\n`;
            mensagem += `--------------------------------\n\n`;
            cart.forEach(item => {
                mensagem += `• ${item.quantity}x ${item.name}\n`;
            });
            mensagem += `\n--------------------------------\n`;
            const totalGeral = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            mensagem += `*TOTAL DA COMANDA:* R$ ${totalGeral.toFixed(2).replace('.', ',')}\n\n`;
            mensagem += `👉 _O cliente solicitou o encerramento. Favor levar a maquininha de cartão até a mesa._`;
            
            // Reseta a mesa após o fechamento
            cart = [];
        }

        saveCartToStorage();

        const telefoneAdega = "5511999999999"; 
        const mensagemFormatada = encodeURIComponent(mensagem);
        const urlLink = `https://wa.me/${telefoneAdega}?text=${mensagemFormatada}`;
        
        updateCartLayout(); 
        window.open(urlLink, '_blank');
    });
}

// =======================================================
// INTERCEPTAR NÚMERO DA MESA VIA URL E INICIALIZAÇÃO
// =======================================================
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mesaParam = urlParams.get('mesa');

    if (mesaParam && orderLocationSelect) {
        if (mesaParam.toLowerCase() === 'delivery') {
            orderLocationSelect.value = 'delivery';
        } else {
            orderLocationSelect.value = `mesa-${mesaParam}`;
        }
    }
    updateCartLayout();
});