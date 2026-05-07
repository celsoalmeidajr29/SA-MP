# Funcionalidades Completas — OSC

## Bot WhatsApp

| Funcionalidade | Comando de Exemplo | Status |
|---|---|---|
| Salvar nota | "Salva: reunião com João" | ✅ |
| Agendar compromisso | "Agende reunião para sexta às 15h" | ✅ |
| Criar lembrete | "Me lembre de tomar remédio amanhã às 8h" | ✅ |
| Buscar na memória | "Qual era o nome do médico que consultei?" | ✅ |
| Resumir documento enviado | (envia PDF) | ✅ |
| Transcrever áudio | (envia mensagem de voz) | ✅ |
| Descrever imagem | (envia foto) | ✅ |
| Salvar no Google Drive | (envia arquivo com Drive conectado) | ✅ |
| Busca semântica | "O que eu falei sobre o projeto X?" | ✅ |

## Dashboard Web

| Tela | Conteúdo | Status |
|---|---|---|
| Landing page | Vendas, demo, planos | ✅ |
| Cadastro | Formulário + trial automático | ✅ |
| Login | NextAuth credentials | ✅ |
| Dashboard home | Stats, trial banner, uso diário | ✅ |
| Notas | Grid de memórias por tipo | ✅ |
| Arquivos | Lista com uso de storage | ✅ |
| Lembretes | Compromissos e lembretes ativos | ✅ |
| Integrações | Drive, Gmail, Obsidian, em breve | ✅ |
| Meu plano | Upgrade, uso, fatura | 🔲 |
| Saúde | Memórias do tipo health | 🔲 |

## Integrações

| Integração | Função | Status |
|---|---|---|
| Google Drive | Storage de arquivos no Drive do usuário | ✅ |
| Gmail | Salvar e-mails como memórias | ✅ (OAuth pronto) |
| Obsidian REST API | Sync de notas do Vault | 🔲 (documentado) |
| Google Calendar | Sync de compromissos | 🔲 |
| Notion | Salvar memórias no Notion | 🔲 |
| App Android | Painel mobile | 🔲 |
| App iOS | Painel mobile | 🔲 |

## Limites por Plano

| Recurso | Grátis | Pro |
|---|---|---|
| Mensagens/dia | 50 | ∞ |
| Tokens IA/dia | 30.000 | ∞ |
| Storage | 100 MB (MinIO) | Drive do usuário |
| Lembretes ativos | 5 | ∞ |
| Documentos/mês | 3 | ∞ |
| Histórico memória | 30 dias | ∞ |
| Trial gratuito | 7 dias Pro | — |
