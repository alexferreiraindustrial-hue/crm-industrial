# Proposta (ainda NÃO publicada na imagem). Espelha o padrão de CrmRemindersJob.
#
# Objetivo: de hora em hora (horário comercial SP), para cada conta com assistente_ia ligado,
# montar um briefing só de leitura (resumo + urgências + tarefas sugeridas) e gravar em
# CrmReminder / nota interna — nunca outbound.
#
# Para publicar: copiar para app/jobs/, registrar em config/schedule.yml, implementar Builder
# reutilizando CrmAi::Tools::* + CrmAi::Access com um usuário admin da conta (ou o dono).
#
# schedule.yml (proposta):
# crm_ai_proactive_briefing_job:
#   cron: '0 * * * *'
#   class: 'CrmAiProactiveBriefingJob'
#   queue: scheduled_jobs

class CrmAiProactiveBriefingJob < ApplicationJob
  queue_as :scheduled_jobs

  BRIEFING = 'Resuma o que está urgente agora: conversas abertas sem responsável, ' \
             'atrasos de prazo e cartões parados. Liste tarefas internas sugeridas.'

  def perform
    # CrmAi::ProactiveBriefingBuilder.call(question: BRIEFING)
    raise NotImplementedError, 'proposta — builder ainda não publicado'
  end
end
