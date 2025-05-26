document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado, iniciando dashboard...");
    
    try {
        if (!window.ciudadesData || window.ciudadesData.length === 0) {
            throw new Error("No se recibieron datos de las ciudades");
        }
        
        // Procesar y ordenar datos por temperatura descendente
        const ciudadesData = window.ciudadesData.map(c => ({
            ...c,
            ciudad: c.ciudad.split(',')[0].trim(),
            temperatura: parseFloat(c.temperatura),
            lat: parseFloat(c.lat),
            lon: parseFloat(c.lon)
        })).sort((a, b) => b.temperatura - a.temperatura);
        
        // Preparar datos para gráficos
        const ciudades = ciudadesData.map(c => c.ciudad);
        const temperaturas = ciudadesData.map(c => c.temperatura);
        const coordenadas = ciudadesData.map(c => ({
            ciudad: c.ciudad,
            lat: c.lat,
            lon: c.lon,
            temp: c.temperatura,
            humedad: c.humedad,
            condicion: c.condicion
        }));
        
        // Crear visualizaciones
        createOpenStreetMap(coordenadas);
        createTemperatureChart(ciudades, temperaturas);
        
    } catch (error) {
        console.error("Error al crear dashboard:", error);
        showError("Error al cargar los gráficos. Ver consola para detalles.");
    }
});

function createOpenStreetMap(coordenadas) {
    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) throw new Error("Contenedor del mapa no encontrado");
        
        // Centrar el mapa en México aproximadamente
        const map = L.map('map').setView([23.6345, -102.5528], 5);
        
        // Añadir capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Añadir marcadores para cada ciudad
        coordenadas.forEach(ciudad => {
            const marker = L.marker([ciudad.lat, ciudad.lon]).addTo(map);
            
            // Popup con información
            marker.bindPopup(`
                <b>${ciudad.ciudad}</b><br>
                Temperatura: ${ciudad.temp}°C<br>
                Humedad: ${ciudad.humedad}%<br>
                Condición: ${ciudad.condicion}
            `);
            
            // Color del marcador según temperatura
            const color = getMarkerColor(ciudad.temp);
            marker.setIcon(getCustomIcon(color));
        });
        
        console.log("Mapa de OpenStreetMap creado exitosamente");
        
    } catch (error) {
        console.error("Error en createOpenStreetMap:", error);
        showError("Error al crear el mapa: " + error.message);
    }
}

function getMarkerColor(temperatura) {
    // Determinar color basado en la temperatura
    if (temperatura > 28) return '#ff4500'; // Naranja rojizo (caliente)
    if (temperatura > 22) return '#ffa500'; // Naranja
    if (temperatura > 16) return '#ffd700'; // Amarillo
    if (temperatura > 10) return '#add8e6'; // Azul claro
    return '#1e90ff'; // Azul (frío)
}

function getCustomIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<svg viewBox="0 0 24 24" width="24" height="24" fill="${color}">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
    });
}

function createTemperatureChart(ciudades, temperaturas) {
    console.log("Creando gráfica de temperaturas con datos:", { ciudades, temperaturas });
    
    try {
        const canvas = document.getElementById('temperature-chart');
        if (!canvas) throw new Error("Canvas de gráfica no encontrado");
        
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('chart-container');
        
        if (!container) throw new Error("Contenedor de gráfica no encontrado");
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Ajustar tamaño
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        console.log(`Tamaño del canvas: ${canvas.width}x${canvas.height}`);
        
        // Validar datos
        if (!ciudades || !temperaturas || ciudades.length !== temperaturas.length) {
            throw new Error("Datos incompletos para la gráfica");
        }
        
        // Configuración del gráfico
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        // Encontrar rangos de temperatura
        const minTemp = Math.min(...temperaturas);
        const maxTemp = Math.max(...temperaturas);
        const tempRange = maxTemp - minTemp;
        
        // Escala para mapear temperaturas a altura
        const scale = chartHeight / (tempRange * 1.2); // 1.2 para dejar espacio
        
        // Dibujar fondo
        ctx.fillStyle = 'rgba(250, 250, 250, 0.8)';
        ctx.fillRect(padding, padding, chartWidth, chartHeight);
        
        // Dibujar ejes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Marcas y etiquetas del eje Y
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const temp = minTemp + (i / ySteps) * tempRange;
            const y = canvas.height - padding - (temp - minTemp) * scale;
            
            ctx.beginPath();
            ctx.moveTo(padding - 5, y);
            ctx.lineTo(padding, y);
            ctx.stroke();
            
            ctx.fillText(temp.toFixed(1) + '°C', padding - 10, y);
        }
        
        // Dibujar línea de temperatura media
        const avgTemp = temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length;
        const avgY = canvas.height - padding - (avgTemp - minTemp) * scale;
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(padding, avgY);
        ctx.lineTo(canvas.width - padding, avgY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Dibujar barras
        const barWidth = chartWidth / ciudades.length * 0.8;
        const gap = chartWidth / ciudades.length * 0.2;
        
        for (let i = 0; i < ciudades.length; i++) {
            const x = padding + i * (barWidth + gap) + gap/2;
            const barHeight = (temperaturas[i] - minTemp) * scale;
            const y = canvas.height - padding - barHeight;
            
            // Color basado en temperatura
            const normalized = (temperaturas[i] - minTemp) / tempRange;
            let color;
            
            if (normalized < 0.33) {
                // Azul frío
                color = `rgb(91, 155, ${213 - normalized * 100})`;
            } else if (normalized < 0.66) {
                // Amarillo
                color = `rgb(255, ${247 - normalized * 100}, 66)`;
            } else {
                // Naranja
                color = `rgb(255, ${147 - normalized * 50}, 25)`;
            }
            
            // Dibujar barra
            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Borde de la barra
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Valor de temperatura
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(temperaturas[i].toFixed(1) + '°C', x + barWidth/2, y - 5);
            
            // Etiqueta de ciudad
            ctx.fillStyle = '#333';
            ctx.textBaseline = 'top';
            ctx.translate(x + barWidth/2, canvas.height - padding + 5);
            
            // Rotar texto si hay muchas ciudades
            if (ciudades.length > 5) {
                ctx.rotate(-Math.PI/4);
            }
            
            ctx.fillText(ciudades[i], 0, 0);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        // Título del gráfico
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Temperaturas por Ciudad', canvas.width / 2, padding - 10);
        
        // Manejar redimensionamiento
        window.addEventListener('resize', function() {
            console.log("Redimensionando ventana...");
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            createTemperatureChart(ciudades, temperaturas); // Redibujar
        });
        
    } catch (error) {
        console.error("Error en createTemperatureChart:", error);
        showError("Error al crear la gráfica de temperaturas: " + error.message);
    }
}