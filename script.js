document.addEventListener('DOMContentLoaded', () => {
    // Criação do Grid
    const gridContainer = document.querySelector('.grid-container');

    for (let i = 0; i < 400; i++) {
        let row = Math.floor(i / 20);
        let col = i % 20;
        let color = '';

        if (row < 10 && col < 10) {
            color = '#ffcccc'; // superior esquerdo
        } else if (row < 10 && col >= 10) {
            color = '#ffccff'; // superior direito
        } else if (row >= 10 && col < 10) {
            color = '#ccffcc'; // inferior esquerdo
        } else if (row >= 10 && col >= 10) {
            color = '#ccccff'; // inferior direito
        }

        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.style.backgroundColor = color;
        gridContainer.appendChild(gridItem);
    }
});

document.getElementById('file-input').addEventListener('change', function(event) {
    const files = event.target.files;

    Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('image-wrapper');
            const img = document.createElement('img');
            img.src = e.target.result;

            // Estilização inicial da imagem
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';

            imageWrapper.appendChild(img);
            // Adiciona a imagem à barra lateral
            document.querySelector('.imagem-container').appendChild(imageWrapper); // Mudança aqui

            interact(imageWrapper).draggable({
                onmove: dragMoveListener,
                onend: function (event) {
                    checkDeleteArea(event.target);
                }
            }).resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                preserveAspectRatio: true  // Garante que a proporção da imagem será mantida
            }).on('resizemove', function(event) {
                const { x, y } = event.target.dataset;

                const newX = (parseFloat(x) || 0) + event.deltaRect.left;
                const newY = (parseFloat(y) || 0) + event.deltaRect.top;

                // Ajuste a largura e altura mantendo a proporção
                event.target.style.width = `${event.rect.width}px`;
                event.target.style.height = `${event.rect.height}px`;

                event.target.style.transform = `translate(${newX}px, ${newY}px)`;

                event.target.dataset.x = newX;
                event.target.dataset.y = newY;
            });
        };

        reader.readAsDataURL(file);
    });

    event.target.value = '';
});

function dragMoveListener(event) {
    const target = event.target;
    const { x, y } = target.dataset;

    const newX = (parseFloat(x) || 0) + event.dx;
    const newY = (parseFloat(y) || 0) + event.dy;

    target.style.transform = `translate(${newX}px, ${newY}px)`;

    target.dataset.x = newX;
    target.dataset.y = newY;
}

function checkDeleteArea(target) {
    const deleteArea = document.getElementById('delete-area');
    const targetRect = target.getBoundingClientRect();
    const deleteRect = deleteArea.getBoundingClientRect();

    if (
        targetRect.right > deleteRect.left &&
        targetRect.left < deleteRect.right &&
        targetRect.bottom > deleteRect.top &&
        targetRect.top < deleteRect.bottom
    ) {
        target.remove();
    }
}