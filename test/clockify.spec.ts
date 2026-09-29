import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('Clockify API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api.clockify.me/api/v1';
  const apiKey = process.env.CLOCKIFY_API_KEY || 'M2EzYTM2ZTItZmJhZC00NDQzLWI4ZDktZjk2MWY5M2E4ZTg5';

  let workspaceId = '';
  let projectId = '';

  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(rep);

    workspaceId = await p
      .spec()
      .get(`${baseUrl}/workspaces`)
      .withHeaders({ 'X-Api-Key': apiKey })
      .expectStatus(StatusCodes.OK)
      .returns('[0].id');
  });

  afterAll(() => p.reporter.end());

  describe('Projects', () => {
    it('criar um novo projeto', async () => {
      projectId = await p
        .spec()
        .withHeaders({ 'X-Api-Key': apiKey })
        .post(`${baseUrl}/workspaces/${workspaceId}/projects`)
        .withJson({
          name: `Projeto QA ${faker.string.alphanumeric(6)}`,
          color: '#f44336',
          billable: false
        })
        .expectStatus(StatusCodes.CREATED)
        .returns('id');
    });

    it('buscar o projeto criado', async () => {
      await p
        .spec()
        .withHeaders({ 'X-Api-Key': apiKey })
        .get(`${baseUrl}/workspaces/${workspaceId}/projects/${projectId}`)
        .expectStatus(StatusCodes.OK);
    });

    it('atualizar o projeto criado', async () => {
      const novoNome = `Projeto QA editado ${faker.string.alphanumeric(6)}`;

      await p
        .spec()
        .withHeaders({ 'X-Api-Key': apiKey })
        .put(`${baseUrl}/workspaces/${workspaceId}/projects/${projectId}`)
        .withJson({
          name: novoNome,
          color: '#4caf50',
          billable: false
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains(novoNome);
    });

    it('arquivar o projeto antes de deletar', async () => {
      await p
        .spec()
        .withHeaders({ 'X-Api-Key': apiKey })
        .put(`${baseUrl}/workspaces/${workspaceId}/projects/${projectId}`)
        .withJson({
          archived: true
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ archived: true });
    });

    it('deletar o projeto criado', async () => {
      await p
        .spec()
        .withHeaders({ 'X-Api-Key': apiKey })
        .delete(`${baseUrl}/workspaces/${workspaceId}/projects/${projectId}`)
        .expectStatus(StatusCodes.OK);
    });
  });
});