# Projeto

Criação de uma aplicação chamada Ecoleta. A aplicação tem como objetivo permitir que estabelecimentos cadastrem os tipos de resíduos que fazem coleta e que usuários possam pesquisar o tipo de coleta que procuram em diferentes locais. 
Feita baseada no conteúdo da Semana OmniStack 11.

## Tecnologias

- Node.js para o back-end
  * Uso do Express para facilitar a criação das rotas
- ReactJS para o front-end Web 
- React Native para a aplicação mobile
  * Uso do Expo para facilitar a criação do app mobile
- Banco de Dados SQLite para persistir os dados

- Toda a aplicação foi desenvolvida utilizando Typescript

## Instalação

Para começar a utilizar o projeto, deve-se clonar o repositório e entrar na pasta do projeto:

```
git clone https://github.com/pedrovicentesantos/nlw-01
cd nlw-01
```

O segundo passo é entrar em cada uma das subpastas `server`, `web` e `mobile` e usar o seguinte comando:

```
npm start
```

Feito isto, a aplicação estará rodando e pode ser utilizada no servidor local acessando:

```
localhost:3000   // Para acessar a interface web
localhost:3333   // Para se comunicar com o backend
localhost:19002  // Para acessar o Expo
```