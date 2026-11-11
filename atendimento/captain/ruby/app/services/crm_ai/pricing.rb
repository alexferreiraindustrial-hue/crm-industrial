# Preço por milhão de tokens de cada modelo, lido do registro de modelos do próprio Chatwoot (config/llm_models.json).
# O custo é uma estimativa: a cobrança que vale é a da OpenAI.
module CrmAi::Pricing
  REGISTRY = Rails.root.join('config/llm_models.json')

  module_function

  def cost_usd(model, input_tokens, output_tokens)
    price = prices_for(model)
    return 0.to_d if price.nil?

    ((input_tokens.to_i * price[:input]) + (output_tokens.to_i * price[:output])) / 1_000_000
  end

  def prices_for(model)
    standard = registry[model.to_s]&.dig('pricing', 'text_tokens', 'standard')
    return if standard.blank?

    { input: standard['input_per_million'].to_d, output: standard['output_per_million'].to_d }
  end

  def registry
    @registry ||= begin
      data = JSON.parse(REGISTRY.read)
      list = data.is_a?(Array) ? data : data.fetch('models', [])
      list.index_by { |entry| entry['id'] }
    rescue StandardError
      {}
    end
  end
end
