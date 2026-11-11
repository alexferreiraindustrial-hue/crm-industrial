# Registro de consumo da IA (recurso "Assistente de IA"). Só acrescenta uma tabela; nada existente muda.
# Guarda tokens e custo estimado por pergunta, nunca o texto da pergunta nem da resposta.
class CreateCrmAiUsages < ActiveRecord::Migration[7.1]
  def change
    create_table :crm_ai_usages do |t|
      t.references :account, null: false, foreign_key: true
      t.references :user, foreign_key: { on_delete: :nullify }
      t.string :feature, null: false, default: 'assistente'
      t.string :model, null: false
      t.string :status, null: false, default: 'ok'
      t.integer :input_tokens, null: false, default: 0
      t.integer :output_tokens, null: false, default: 0
      t.integer :tool_calls, null: false, default: 0
      t.decimal :cost_usd, precision: 12, scale: 6, null: false, default: 0
      t.string :error
      t.timestamps
    end
    add_index :crm_ai_usages, [:account_id, :created_at]
  end
end
