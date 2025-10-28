// Função para editar o texto de um rótulo
function editLabel(labelId) {
    var label = document.getElementById(labelId);
    var currentText = label.textContent;

    // Cria um campo de entrada
    var input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.fontSize = '16px';
    input.style.padding = '5px 10px';

    // Substitui o texto pelo campo de entrada
    label.textContent = '';
    label.appendChild(input);
    input.focus();

    // Atualiza o texto ao pressionar Enter ou sair do campo
    input.addEventListener('blur', function () {
        label.textContent = input.value || currentText;  // Se o campo estiver vazio, restaura o texto original
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            input.blur();  // Simula o "perder o foco" ao pressionar Enter
        }
    });
}

// Cria o mapa e define o CRS simples
var map = L.map('map', {
    crs: L.CRS.Simple,
    maxBoundsViscosity: 1.0,  // Limita a visão para os limites
});

// Definir os limites da imagem
var bounds = [[0, 0], [950, 950]];

// Adicionar a imagem ao mapa
var image = L.imageOverlay('assets/compasso.png', bounds).addTo(map);

// Configurar o zoom
map.setMaxZoom(2);  // Nível máximo de zoom
map.setMinZoom(-1);  // Nível mínimo de zoom

// Ajustar o mapa para caber dentro dos limites
map.fitBounds(bounds);

// Limitar a visão para os limites da imagem
map.setMaxBounds(bounds);

// Centralizar o mapa em um ponto inicial com zoom adequado
map.setView([400, 400], 0);  // Centraliza no meio da imagem (400, 400)

// Função para abrir o seletor de arquivos quando o botão for clicado
document.getElementById('add-image-btn').addEventListener('click', function () {
    document.getElementById('file-input').click();
});

// Função para lidar com a adição de imagens
document.getElementById('file-input').addEventListener('change', function (event) {
    var files = event.target.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = function (e) {
            var imgUrl = e.target.result;
            addImageToMap(imgUrl);
        };
        reader.readAsDataURL(file);  // Lê a imagem como URL base64
    }
});

// Função para adicionar a imagem ao mapa e permitir movimentação com o mouse
function addImageToMap(imgUrl) {
    var imageBounds = [[400, 400], [500, 500]];  // Defina os limites iniciais da imagem
    var overlay = L.imageOverlay(imgUrl, imageBounds, { interactive: true }).addTo(map);

    var isImageSelected = false;  // Flag para verificar se a imagem foi selecionada
    var startLatLng;

    // Define o cursor para "mover"
    overlay.getElement().style.cursor = 'move';

    // Evento para selecionar e começar a mover a imagem com um clique
    overlay.getElement().addEventListener('click', function (e) {
        if (!isImageSelected) {
            isImageSelected = true;  // Marca a imagem como selecionada
            startLatLng = map.mouseEventToLatLng(e);  // Pega a posição inicial do clique
            overlay.getElement().style.cursor = 'grabbing';  // Mudança de cursor ao selecionar
        } else {
            isImageSelected = false;  // Deseleciona a imagem ao clicar novamente
            overlay.getElement().style.cursor = 'move';  // Volta para o cursor original
        }
    });

    // Evento para mover a imagem quando estiver selecionada
    overlay.getElement().addEventListener('mousemove', function (e) {
        if (!isImageSelected) return;  // Não faz nada se a imagem não estiver selecionada

        var endLatLng = map.mouseEventToLatLng(e);
        var latDiff = endLatLng.lat - startLatLng.lat;
        var lngDiff = endLatLng.lng - startLatLng.lng;

        // Atualiza os limites da imagem com base no movimento do mouse
        imageBounds[0][0] += latDiff;
        imageBounds[0][1] += lngDiff;
        imageBounds[1][0] += latDiff;
        imageBounds[1][1] += lngDiff;

        // Atualiza os limites da imagem
        overlay.setBounds(imageBounds);

        // Atualiza o ponto de início para o próximo movimento
        startLatLng = endLatLng;
    });

    // Quando a imagem for clicada novamente, o movimento é desativado
    overlay.getElement().addEventListener('mouseup', function () {
        if (isImageSelected) {
            isImageSelected = false;
            overlay.getElement().style.cursor = 'move';  // Volta o cursor ao estado normal
        }
    });
}