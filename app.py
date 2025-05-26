# -*- coding: utf-8 -*-
"""
Created on Mon May 19 22:17:10 2025
"""

from flask import Flask, jsonify, render_template, request, redirect, url_for, flash
from flask_mysqldb import MySQL
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import json

load_dotenv(r'.env')
API_KEY = os.getenv("API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

# print("API_KEY cargada:", API_KEY)

# if not API_KEY:
#     print(" Error: No se cargó API_KEY desde .env")


app = Flask(__name__)
CORS(app)

# Mysql connection

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'bd_clima'
mysql = MySQL(app)




# Lista de 10 ciudades predefinidas
ciudades = [
    "Mexico City, MX", "Monterrey, MX", "Guadalajara, MX", "Toluca, MX", "Tijuana, MX",
    "León, MX", "Querétaro, MX", "Villahermosa, MX", "Hermosillo, MX", "Acapulco, MX"
]

def obtener_datos_ciudades_API():
    with app.app_context():  # Establecer el contexto de la aplicación
        # Vaciar la tabla
        try:
            cur = mysql.connection.cursor()
            cur.execute('TRUNCATE TABLE ciudades')
            mysql.connection.commit()
            cur.close()
            print("Tabla limpiada correctamente")
        except Exception as e:
            print(f"Error al limpiar la tabla: {str(e)}")
            return {"error": f"No se pudo limpiar la tabla: {str(e)}"}
        
        # Colocar datos en la tabla
        datos_ciudades = []
        
        for ciudad in ciudades:
            try:
                params = {
                    "q": ciudad,
                    "appid": API_KEY,
                    "units": "metric",
                    "lang": "es"
                }
                response = requests.get(BASE_URL, params=params)
                
                if response.status_code == 200:
                    datos_ciudad = response.json()
                    datos_ciudades.append(datos_ciudad)
                    
                    # Insertar datos en MySQL
                    insertar_en_bd(ciudad, datos_ciudad)
                    
                else:
                    print(f"Error al obtener datos para {ciudad}: Código {response.status_code}")
                    datos_ciudades.append({
                        "ciudad": ciudad,
                        "error": f"No se pudieron obtener datos. Código: {response.status_code}"
                    })
                    
            except requests.exceptions.RequestException as e:
                print(f"Error de conexión para {ciudad}: {str(e)}")
                datos_ciudades.append({
                    "ciudad": ciudad,
                    "error": f"Error de conexión: {str(e)}"
                })
        
        return datos_ciudades

def insertar_en_bd(ciudad, datos_ciudad):
    try:
        # Extraer datos
        temperatura = datos_ciudad.get("main", {}).get("temp", None)
        humedad = datos_ciudad.get("main", {}).get("humidity", None)
        condicion = datos_ciudad.get("weather", [{}])[0].get("description", "Desconocido")        
        lat = datos_ciudad['coord']['lat']
        lon = datos_ciudad['coord']['lon']

        # Cursor y ejecutar consulta
        cur = mysql.connection.cursor()
        cur.execute('''
            INSERT INTO ciudades (ciudad, temperatura, humedad, condicion, lat, lon) 
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (ciudad, temperatura, humedad, condicion, lat, lon))
        
        mysql.connection.commit()
        cur.close()
        
        print(f"Datos de {ciudad} insertados correctamente en la BD")
        
    except Exception as e:
        print(f"Error al insertar datos de {ciudad} en la BD: {str(e)}")
        mysql.connection.rollback()

@app.route('/')
def dashboard():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM ciudades')
        column_names = [i[0] for i in cur.description]  # Obtener nombres de columnas
        data = cur.fetchall()
        
        # Convertir a lista de diccionarios
        ciudades = []
        for row in data:
            ciudades.append(dict(zip(column_names, row)))
        
        cur.close()
        return render_template('index.html', ciudades=ciudades)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    # Se ejecuta SOLO UNA VEZ al iniciar
    resultados = obtener_datos_ciudades_API()  
    
    # Inicia Flask 
    app.run(port = 3000, debug=True, use_reloader=False)
