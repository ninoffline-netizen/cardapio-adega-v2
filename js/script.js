// =======================================================
// 1. MAPEAMENTO DE ELEMENTOS DO HTML
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

// Nosso Array (Lista) que guardará a comanda da mesa na memória
let cart = [];

// =======================================================
// CONTROLE DE FILTROS DE CATEGORIAS
// =======================================================
const categoryButtons = document.querySelectorAll('.category-item');
const productItems = document.querySelectorAll('.product-item');

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 1. Remove a classe 'active' de todos os botões e coloca só no clicado
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 2. Pega a categoria do botão que foi clicado
        const categoriaSelecionada = button.getAttribute('data-category');

        // 3. Varre todos os produtos do cardápio
        productItems.forEach(item => {
            const categoriaProduto = item.getAttribute('data-category');

            // Se for 'todos' ou se a categoria do produto bater com a selecionada, mostra
            if (categoriaSelecionada === 'todos' || categoriaSelecionada === categoriaProduto) {
                item.style.display = 'flex'; // Volta a mostrar o card
            } else {
                item.style.display = 'none'; // Esconde o produto
            }
        });
    });
});

// =======================================================
// 2. CONTROLE DO MODAL (ABRIR E FECHAR A JANELA)
// =======================================================

// Abre a janela do carrinho ao clicar no rodapé
openCartBtn.addEventListener('click', () => {
    cartModal.style.display = 'flex';
});

// Fecha a janela ao clicar no "X"
closeModalBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

// Fecha a janela se o cliente clicar na parte escura de fora
window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// =======================================================
// 3. ADICIONAR ITENS AO CARRINHO
// =======================================================

// Monitora o clique em cada botão "+" do cardápio
addCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));
        
        addToCart(name, price);
    });
});

function addToCart(name, price) {
    // Busca se já existe esse item no carrinho E que ainda NÃO foi enviado
    const existingItem = cart.find(item => item.name === name && item.enviado === false);

    if (existingItem) {
        // Se achou um item novo igual, só aumenta a quantidade
        existingItem.quantity += 1;
    } else {
        // Se não achou, insere um novo objeto na lista
        cart.push({
            name: name,
            price: price,
            quantity: 1,
            enviado: false // Começa falso porque o cliente acabou de clicar
        });
    }
    
    // Atualiza a tela imediatamente
    updateCartLayout();
}

// =======================================================
// 4. ATUALIZAR O VISUAL DA JANELE DE PEDIDOS (CONTEÚDO)
// =======================================================

// =======================================================
// 4. ATUALIZAR O VISUAL DA JANELA DE PEDIDOS (CONTEÚDO)
// =======================================================
// =======================================================
// 4. ATUALIZAR O VISUAL DA JANELA DE PEDIDOS (CONTEÚDO)
// =======================================================
function updateCartLayout() {
    cartItemsContainer.innerHTML = '';
    
    let totalGeral = 0;
    let totalItens = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-text">Nenhum pedido aberto nesta mesa.</p>';
        modalTotalValue.textContent = 'R$ 0,00';
        cartBadgeCount.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalGeral += itemTotal;
        totalItens += item.quantity;

        const itemElement = document.createElement('div');
        
        const corTexto = item.enviado ? '#8d8d99' : '#fff';
        const tagStatus = item.enviado 
            ? '<span style="color: #ffb800; font-size: 0.75rem;">✔️ Na Mesa</span>' 
            : '<span style="color: #04d361; font-size: 0.75rem;">⏳ Novo (A enviar)</span>';

        itemElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #27272a;">
                <div>
                    <h4 style="color: ${corTexto}; font-size: 0.95rem;">${item.name} ${tagStatus}</h4>
                    
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                        ${!item.enviado ? `
                            <button onclick="diminuirQtd(${index})" style="background-color: #27272a; color: #fff; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-weight: bold;">-</button>
                            <span style="color: #fff; font-size: 0.9rem; font-weight: bold; min-width: 15px; text-align: center;">${item.quantity}</span>
                            <button onclick="aumentarQtd(${index})" style="background-color: #27272a; color: #fff; border: none; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                        ` : `
                            <span style="color: #8d8d99; font-size: 0.85rem;">${item.quantity}x R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                        `}
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="color: #04d361; font-weight: bold; font-size: 0.95rem; margin-right: 5px;">
                        R$ ${itemTotal.toFixed(2).replace('.', ',')}
                    </span>
                    
                    ${item.enviado ? `
                        <button onclick="voltarParaRascunho(${index})" title="Modificar este item" style="background: none; border: none; color: #ffb800; cursor: pointer; padding: 5px;">
                            <i class="fas fa-pen"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(itemElement);
    });

    modalTotalValue.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    cartBadgeCount.textContent = totalItens;
    
    const temNovosItens = cart.some(item => !item.enviado);
    
    if (temNovosItens) {
        sendWhatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Enviar Alteração / Nova Rodada';
        sendWhatsappBtn.style.backgroundColor = '#04d361';
        sendWhatsappBtn.style.color = '#ffffff';
    } else {
        sendWhatsappBtn.innerHTML = '<i class="fas fa-check-double"></i> Pedir para Fechar a Conta';
        sendWhatsappBtn.style.backgroundColor = '#ffb800';
        sendWhatsappBtn.style.color = '#0f0f12';
    }
}

// =======================================================
// NOVAS FUNÇÕES: CONTROLE FINO DE QUANTIDADE NO MODAL
// =======================================================

// Aumenta a quantidade em +1 direto no carrinho
window.aumentarQtd = function(index) {
    cart[index].quantity += 1;
    updateCartLayout();
}

// Diminui a quantidade em -1. Se chegar a 0, remove o item da lista
window.diminuirQtd = function(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        // Se era 1 e clicou em menos, entende que é para deletar o produto
        cart.splice(index, 1);
    }
    updateCartLayout();
}

// Transforma o item enviado de volta para rascunho/novo
window.voltarParaRascunho = function(index) {
    cart[index].enviado = false;
    updateCartLayout();
}

// Função para remover item novo da lista (Lixeira)
window.removeItem = function(index) {
    cart.splice(index, 1);
    updateCartLayout();
}

// NOVA FUNÇÃO: Transforma o item enviado de volta para rascunho/novo
window.voltarParaRascunho = function(index) {
    // Altera o status do item clicado para falso (ele volta a ser editável)
    cart[index].enviado = false;
    
    // Atualiza o layout na tela para liberar os botões de exclusão
    updateCartLayout();
}
// Função acionada pelo botão da lixeira (remover item não enviado)
// Usamos o 'window.' para garantir que o HTML encontre a função globalmente
window.removeItem = function(index) {
    cart.splice(index, 1);
    updateCartLayout();
}

// =======================================================
// 5. DISPARAR MENSAGEM DO WHATSAPP (AÇÃO DO BOTÃO)
// =======================================================
sendWhatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const localizacao = orderLocationSelect.value;
    const numeroMesa = localizacao.replace('mesa-', '').toUpperCase();
    
    // Separa o que acabou de ser adicionado para mandar para o atendente
    const novosItens = cart.filter(item => !item.enviado);
    
    let mensagem = "";
    
    if (novosItens.length > 0) {
        // --- CASO A: CLIENTE ESTÁ PEDINDO MAIS COISAS ---
        mensagem = `*🔥 NOVA RODADA - MESA ${numeroMesa}* 🍻\n`;
        mensagem += `--------------------------------\n\n`;
        
        novosItens.forEach(item => {
            mensagem += `*${item.quantity}x* ${item.name}\n`;
        });
        
        mensagem += `\n--------------------------------\n`;
        mensagem += `_Por favor, tragam na mesa assim que puderem!_`;
        
        // Passa todos para o status de enviados (já estão a caminho)
        cart.forEach(item => item.enviado = true);
        
    } else {
        // --- CASO B: NÃO HÁ NADA NOVO, CLIENTE QUER A CONTA ---
        mensagem = `*💳 SOLICITAÇÃO DE FECHAMENTO - MESA ${numeroMesa}* 🔥\n`;
        mensagem += `--------------------------------\n\n`;
        
        cart.forEach(item => {
            mensagem += `• ${item.quantity}x ${item.name}\n`;
        });
        
        mensagem += `\n--------------------------------\n`;
        const totalGeral = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        mensagem += `*TOTAL DA COMANDA:* R$ ${totalGeral.toFixed(2).replace('.', ',')}\n\n`;
        mensagem += `👉 _O cliente solicitou o encerramento. Favor levar a maquininha de cartão até a mesa._`;
    }

    // Configuração do telefone receptor (substitua pelo oficial quando for colocar no cliente)
    const telefoneAdega = "5511999999999"; 
    const mensagemFormatada = encodeURIComponent(mensagem);
    const urlLink = `https://wa.me/${telefoneAdega}?text=${mensagemFormatada}`;
    
    // Atualiza a tela para mudar as cores e textos do modal
    updateCartLayout(); 
    
    // Abre a aba do WhatsApp
    window.open(urlLink, '_blank');
});
// =======================================================
// INTERCEPTAR NÚMERO DA MESA VIA URL (QR CODE INTELIGENTE)
// =======================================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Lê os parâmetros que estão na barra de endereço (ex: ?mesa=4)
    const urlParams = new URLSearchParams(window.location.search);
    const mesaParam = urlParams.get('mesa');

    // 2. Se existir o parâmetro 'mesa' na URL, configura o select do HTML automaticamente
    if (mesaParam) {
        // Se o parâmetro for 'delivery', muda para delivery, senão monta 'mesa-X'
        if (mesaParam.toLowerCase() === 'delivery') {
            orderLocationSelect.value = 'delivery';
        } else {
            orderLocationSelect.value = `mesa-${mesaParam}`;
        }
        
        // Desabilita o select para o cliente não mudar a mesa por engano se o dono quiser travar
        // orderLocationSelect.disabled = true; 
        
        // Atualiza o layout do botão para refletir a mesa certa
        updateCartLayout();
    }
});
