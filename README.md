# Sistema de Doações - Instituto Maria Claro

Projeto para desenvolver um sistema de doação para o Instituto Maria Claro.

Este repositório contém o código-fonte da plataforma completa, que permite que doadores realizem contribuições financeiras, gerenciem seus perfis e visualizem históricos, enquanto administradores possuem acesso a dashboards e gestão de usuários.

---

## 📋 Sobre o Projeto

O projeto é uma aplicação Full-Stack, dividida em microsserviços e conteinerizada, focada em transparência e facilidade de uso.

### Principais Funcionalidades

* **Autenticação e Autorização:** Sistema de Login/Registro com JWT e controle de acesso (Doador, Colaborador, Administrador).
* **Gestão de Doações:** Integração com **Mercado Pago** para processamento de pagamentos.
* **Área do Doador:** Perfil editável, histórico de doações e status.
* **Painel Administrativo:** Dashboards, gestão de usuários e relatórios.
* **Notificações:** Envio de e-mails transacionais via **SendGrid**.

---

## 🚀 Tecnologias Utilizadas

### Frontend
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Estilização:** Tailwind CSS e CSS Modules
* **Linguagem:** TypeScript

### Backend
* **Framework:** ASP.NET Core Web API (.NET 8)
* **Linguagem:** C#
* **Banco de Dados:** PostgreSQL
* **ORM:** Entity Framework Core

### Infraestrutura
* **Docker:** Docker Compose para orquestração.

---

## ⚙️ Pré-requisitos

Para executar este projeto, você precisará de:

* [Docker](https://www.docker.com/) e Docker Compose instalados.
* [Git](https://git-scm.com/) instalado.

---

## 📦 Como Executar o Projeto

A forma mais simples é utilizando o Docker, que sobe o banco de dados, o backend e o frontend juntos.

### 1. Clonar o Repositório

```bash
git clone [https://github.com/joaoperez1809/doacaomariaclaro.git](https://github.com/joaoperez1809/doacaomariaclaro.git)
cd doacaomariaclaro
