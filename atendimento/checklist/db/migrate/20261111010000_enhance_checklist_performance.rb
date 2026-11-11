class EnhanceChecklistPerformance < ActiveRecord::Migration[7.2]
  def change
    change_table :checklist_items, bulk: true do |t|
      t.integer :user_id
      t.string :kind, null: false, default: 'adhoc'
      t.date :due_on
      t.datetime :done_at
      t.bigint :routine_id
    end
    add_index :checklist_items, [:account_id, :user_id, :due_on]
    add_index :checklist_items, [:account_id, :user_id, :done, :due_on]
    add_index :checklist_items, [:routine_id, :due_on, :user_id], unique: true, where: 'routine_id IS NOT NULL',
                                                                name: 'index_checklist_items_unique_routine_day'

    create_table :checklist_routines do |t|
      t.integer :account_id, null: false
      t.integer :user_id, null: false
      t.string :title, null: false
      t.integer :position, null: false, default: 0
      t.boolean :enabled, null: false, default: true
      t.timestamps
    end
    add_index :checklist_routines, [:account_id, :user_id, :position]
    add_foreign_key :checklist_routines, :accounts
    add_foreign_key :checklist_routines, :users

    create_table :checklist_completion_events do |t|
      t.integer :account_id, null: false
      t.integer :user_id, null: false
      t.bigint :checklist_item_id
      t.string :title, null: false
      t.datetime :completed_at, null: false
      t.date :day, null: false
      t.timestamps
    end
    add_index :checklist_completion_events, [:account_id, :user_id, :day]
    add_index :checklist_completion_events, :checklist_item_id
    add_foreign_key :checklist_completion_events, :accounts
    add_foreign_key :checklist_completion_events, :users
  end
end
