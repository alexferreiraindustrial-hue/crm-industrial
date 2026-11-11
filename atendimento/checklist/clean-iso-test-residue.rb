# Resíduo dos testes de isolamento desta sessão (títulos iso-mine-/iso-peer-).
scope = ChecklistItem.where('title LIKE ? OR title LIKE ?', 'iso-mine-%', 'iso-peer-%')
ids = scope.pluck(:id, :title, :user_id)
deleted_events = ChecklistCompletionEvent.where(checklist_item_id: scope.select(:id)).delete_all
deleted = scope.delete_all
puts "deleted_items=#{deleted} deleted_events=#{deleted_events}"
ids.each { |id, title, user_id| puts "removed id=#{id} user=#{user_id} title=#{title}" }
puts "remaining_iso=#{ChecklistItem.where('title LIKE ? OR title LIKE ?', 'iso-mine-%', 'iso-peer-%').count}"
