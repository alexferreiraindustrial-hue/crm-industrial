# Limite mensal de gasto com a IA, por conta. O administrador define o valor (padrão US$ 5);
# ao chegar no limite, o assistente para de responder até o mês virar.
class CrmAi::Budget
  ZONE = 'America/Sao_Paulo'.freeze
  STORE_KEY = 'crm_ai'.freeze
  DEFAULT_LIMIT = 5
  MAX_LIMIT = 200

  def initialize(account)
    @account = account
  end

  def limit_usd
    value = @account.custom_attributes.to_h.dig(STORE_KEY, 'monthly_limit_usd')
    value.nil? ? DEFAULT_LIMIT.to_d : value.to_d
  end

  def spent_usd
    CrmAiUsage.where(account_id: @account.id).this_month.sum(:cost_usd).to_d
  end

  def available?
    spent_usd < limit_usd
  end

  def set_limit!(value)
    amount = value.to_d
    raise ArgumentError, "Limite entre 0 e #{MAX_LIMIT} dólares" if amount.negative? || amount > MAX_LIMIT

    @account.with_lock do
      attributes = @account.custom_attributes.to_h
      settings = attributes.fetch(STORE_KEY, {}).merge('monthly_limit_usd' => amount.round(2).to_f)
      @account.update!(custom_attributes: attributes.merge(STORE_KEY => settings))
    end
  end

  def summary
    month = CrmAiUsage.where(account_id: @account.id).this_month
    { limit_usd: limit_usd.to_f, spent_usd: spent_usd.round(4).to_f, questions: month.count, errors: month.where(status: 'error').count }
  end
end
