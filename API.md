# Sportune — API REST

## Sobre a API

A API REST do Sportune permite que outras aplicações consultem informações da plataforma por meio de requisições HTTP, recebendo os dados em formato JSON.

## URL base

Durante o desenvolvimento local:

```text
http://localhost:3333/api
```

## Endpoints disponíveis

### 1. Listar publicações

- **Método:** GET
- **Rota:** `/publicacoes`
- **Descrição:** Retorna todas as publicações cadastradas, ordenadas pelas mais recentes.

Exemplo:

```http
GET /api/publicacoes
```

### 2. Buscar publicação por ID

- **Método:** GET
- **Rota:** `/publicacoes/:id`
- **Parâmetro:** `id` — identificador numérico da publicação.
- **Descrição:** Retorna uma publicação específica.

Exemplo:

```http
GET /api/publicacoes/1
```

### 3. Listar atletas

- **Método:** GET
- **Rota:** `/atletas`
- **Descrição:** Retorna os perfis públicos dos usuários classificados como atletas.

Exemplo:

```http
GET /api/atletas
```

### 4. Buscar atleta por ID

- **Método:** GET
- **Rota:** `/atletas/:id`
- **Parâmetro:** `id` — identificador do atleta.
- **Descrição:** Retorna os dados públicos de um atleta específico.

Exemplo:

```http
GET /api/atletas/ID_DO_ATLETA
```

## Formato das respostas

As respostas são enviadas em JSON.

Exemplo de resposta de sucesso:

```json
{
  "sucesso": true,
  "total": 1,
  "publicacoes": [
    {
      "id": 1,
      "usuario_id": "ID_DO_USUARIO",
      "conteudo": "Minha primeira publicação no Sportune!",
      "criado_em": "2026-11-05T12:00:00Z"
    }
  ]
}
```

Exemplo de resposta de erro:

```json
{
  "sucesso": false,
  "mensagem": "Publicação não encontrada."
}
```
## Códigos HTTP

| Código | Significado |
|---|---|
| 200 | Requisição realizada com sucesso |
| 400 | Requisição inválida |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

## Tecnologias utilizadas

- Node.js
- Express
- Sup