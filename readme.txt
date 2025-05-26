Requerimientos Técnicos

Backend (Flask)
Python 3.8+

Dependencias Python (archivo requirements.txt):

flask==2.0.1
flask-mysqldb==1.0.1
python-dotenv==0.19.0
requests==2.26.0

Frontend
Librerías JavaScript:
Leaflet.js (para el mapa OpenStreetMap)

No se requieren React, Bootstrap u otras librerías pesadas

Dependencias del navegador:
Soporte para Canvas HTML5
JavaScript habilitado

Base de Datos
MySQL 5.7+ o MariaDB equivalente

Estructura de la tabla ciudades:

sql
CREATE TABLE `ciudades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ciudad` varchar(100) NOT NULL,
  `temperatura` decimal(5,2) DEFAULT NULL,
  `humedad` int(11) DEFAULT NULL,
  `condicion` varchar(100) DEFAULT NULL,
  `lat` decimal(9,6) DEFAULT NULL,
  `lon` decimal(9,6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

API Externa
Cuenta en OpenWeatherMap
API Key válida para el endpoint de current weather data

Requerimientos de Sistema
Desarrollo
Sistema operativo: Windows 10+, macOS 10.15+ o Linux (Ubuntu 20.04+ recomendado)

RAM: Mínimo 4GB (8GB recomendado)

Almacenamiento: 500MB de espacio disponible

Conexión a internet (para consumir la API y cargar OpenStreetMap)

Producción
Servidor web: Nginx o Apache

WSGI server: Gunicorn o uWSGI (para despliegue Flask)

Base de datos: MySQL/MariaDB en servidor separado o local

Recursos:

1 vCPU mínimo
1GB RAM mínimo
10GB almacenamiento

Requerimientos Funcionales
Obtención de datos:

Consultar API de OpenWeatherMap para las 10 ciudades mexicanas definidas

Almacenar datos en base de datos MySQL

Actualizar datos automáticamente al iniciar la aplicación

Visualización:

Mostrar mapa interactivo con ubicación de ciudades

Gráfica de barras con temperaturas en orden descendente

Tabla con todos los datos climáticos

Diseño responsivo para móviles y desktop

Interactividad:

Popups con información detallada al hacer clic en marcadores del mapa

Gráfica redimensionable según tamaño de pantalla

Feedback visual para temperaturas (colores según rango)

Requerimientos No Funcionales
Rendimiento:

Tiempo de carga inicial < 3 segundos

Actualización de datos desde API en < 5 segundos

Usabilidad:

Interfaz intuitiva sin necesidad de instrucciones

Accesible desde navegadores modernos (Chrome, Firefox, Edge, Safari)

Seguridad:

API Key protegida en archivo .env

Conexión a MySQL con credenciales seguras

No almacenamiento de datos sensibles

Disponibilidad:

Funcionamiento 24/7 en entorno de producción

Tolerancia a fallos en conexión con API externa

Configuración Inicial
Archivo .env (requerido en el directorio raíz):

API_KEY=tu_api_key_de_openweathermap
FLASK_ENV=development
MYSQL_DB=bd_clima
MYSQL_USER=tu_usuario
MYSQL_PASSWORD=tu_contraseña
Estructura de directorios:

/proyecto
├── app.py
├── requirements.txt
├── .env
├── templates/
│   ├── base.html
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── dashboard.js
Dependencias Opcionales para Desarrollo
Virtualenv (para ambiente virtual Python):

bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
Herramientas de prueba:

Postman o curl para probar endpoints API

MySQL Workbench o adminer para gestión de base de datos