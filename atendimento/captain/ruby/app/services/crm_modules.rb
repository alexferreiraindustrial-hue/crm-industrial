# Funcionalidades opcionais do CRM Industrial. Cada uma começa desligada e o administrador liga em
# Configurações → Recursos. A escolha fica em accounts.custom_attributes['crm_modules'].
module CrmModules
  # chave => { name:, description:, place: } (place = onde aparece quando ligada)
  REGISTRY = {
    'relatorios_kanban' => {
      name: 'Relatórios do Kanban',
      description: 'Pedidos por etapa, atrasos, carga por pessoa, meta do mês e planilha',
      place: 'Kanban, na troca entre Kanban e Lista'
    },
    'produtos_kanban' => {
      name: 'Produtos e serviços no cartão',
      description: 'Catálogo com preço e itens do pedido no cartão; o valor do cartão vira a soma dos itens',
      place: 'cartão do Kanban (aba Itens) e menu ⋮ do Kanban'
    },
    'mensagens_agendadas' => {
      name: 'Mensagens agendadas',
      description: 'Programa mensagens para um ou mais contatos, com repetição e horário comercial; envia pela conversa que o contato já tem',
      place: 'Calendário, botão direito na conversa e menu + do card'
    },
    'api_envio' => {
      name: 'API de envio (ERP e n8n)',
      description: 'Outro sistema manda mensagem de WhatsApp pelo CRM, com chave própria, limite por minuto e proteção contra envio duplicado',
      place: 'Configurações → Recursos, botão "Chaves da API"'
    },
    'salas_equipe' => {
      name: 'Salas da equipe',
      description: 'Chat interno: canais por setor e conversa direta entre colegas, sem misturar com o cliente',
      place: 'lista de conversas, botão "Equipe" ao lado dos filtros'
    },
    'assistente_ia' => {
      name: 'Assistente de IA',
      description: 'Responde perguntas sobre conversas, atividades e Kanban, só com o que cada pessoa já vê; não envia nem altera nada. ' \
                   'Usa a chave OpenAI da conta, com limite mensal de gasto',
      place: 'menu do seu perfil'
    },
    'pix_conversa' => {
      name: 'PIX na conversa',
      description: 'Botão + no campo de digitação: gera a cobrança PIX (QR Code e Copia e Cola) com a chave da empresa e envia ao cliente ' \
                   'depois de confirmar',
      place: 'campo de digitação da conversa, botão +'
    },
    'ferramentas_conversa' => {
      name: 'Ferramentas de ajuda',
      description: 'Calculadora, conversor de unidades e cubagem, e modelos de mensagem com campos para preencher',
      place: 'menu do seu perfil'
    },
    'modo_apresentacao' => {
      name: 'Modo apresentação',
      description: 'Borra nomes, telefones e mensagens para mostrar a tela sem expor clientes',
      place: 'menu do seu perfil'
    }
  }.freeze

  STORE_KEY = 'crm_modules'.freeze

  module_function

  def registry
    REGISTRY
  end

  def known?(key)
    registry.key?(key.to_s)
  end

  def enabled?(account, key)
    known?(key) && account.custom_attributes.to_h.dig(STORE_KEY, key.to_s) == true
  end

  def list(account)
    registry.map do |key, info|
      { key: key, name: info[:name], description: info[:description], place: info[:place], enabled: enabled?(account, key) }
    end
  end

  def set!(account, key, enabled)
    raise ArgumentError, 'recurso desconhecido' unless known?(key)

    account.with_lock do
      attributes = account.custom_attributes.to_h
      chosen = attributes.fetch(STORE_KEY, {}).merge(key.to_s => enabled == true)
      account.update!(custom_attributes: attributes.merge(STORE_KEY => chosen))
    end
  end
end
