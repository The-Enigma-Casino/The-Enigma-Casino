# 🧩 Base de Datos

Este módulo define la estructura relacional de datos que sustenta el funcionamiento del sistema The Enigma Casino. La base de datos utiliza MySQL 8+ en producción y SQLite en entorno local, siguiendo buenas prácticas de normalización y consistencia de claves foráneas.

## 📌 Diagrama Entidad-Relación

Este diagrama muestra las relaciones principales entre las entidades de usuarios, juegos, compras y relaciones sociales dentro de la plataforma.

![Shema](/backend/db/dark-database-schema.png)

## 📂 Entidades

- **🧑‍💼 users** : Usuarios registrados en la plataforma.

- **💰 coins_pack** : Representa paquetes de monedas disponibles para compra.

- **🧾 orders** : Registra las compras realizadas por los usuarios.

- **🎲 game_tables** : Define las mesas disponibles para jugar.

- **📊 game_histories** : Historial de participación de los usuarios en las mesas.

- **🤝 friendRequests** : Solicitudes de amistad entre usuarios.

- **👥 user_friends** : Relación bidireccional entre usuarios que se han agregado como amigos.

⚠️ Existen otras entidades adicionales, pero no forman parte del modelo persistente: se utilizan localmente en la lógica de los juegos.