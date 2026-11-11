# Base das consultas que o assistente pode fazer. Todas só leem, sempre pelo filtro de acesso de quem pergunta,
# e devolvem JSON curto. Passado o limite de consultas por pergunta, a ferramenta para de responder dados.
class CrmAi::Tools::Base < RubyLLM::Tool
  STATUS = { 'open' => 'aberta', 'pending' => 'pendente', 'snoozed' => 'adiada', 'resolved' => 'resolvida' }.freeze
  MAX_LIMIT = 10

  def initialize(access)
    super()
    @access = access
  end

  def execute(**args)
    return { erro: 'Limite de consultas desta pergunta atingido. Responda com o que já tem.' }.to_json unless @access.count_call!

    run(**args.symbolize_keys).to_json
  rescue StandardError => e
    Rails.logger.warn("[CrmAi] consulta #{self.class.tool_name} falhou: #{e.class}")
    { erro: 'A consulta falhou.' }.to_json
  end

  private

  def limit_of(value)
    value.to_i.clamp(1, MAX_LIMIT).then { |number| value.blank? ? 5 : number }
  end

  def local_time(value)
    value&.in_time_zone(CrmAi::Access::ZONE)&.strftime('%d/%m/%Y %H:%M')
  end

  def local_date(value)
    value&.strftime('%d/%m/%Y')
  end
end
