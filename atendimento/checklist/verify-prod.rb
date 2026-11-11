puts "routines=#{ChecklistRoutine.table_exists?}"
puts "events=#{ChecklistCompletionEvent.table_exists?}"
puts "done_at=#{ChecklistItem.column_names.include?('done_at')}"
puts Rails.application.routes.recognize_path('/api/v1/accounts/1/checklist_board', method: :get)[:controller]
