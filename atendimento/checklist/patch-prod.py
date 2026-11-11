from pathlib import Path

acc = Path('/tmp/account-checklist.rb')
text = acc.read_text()
bad = 'has_many :checklist_routines, dependent: :destroy_async\\n  has_many :checklist_completion_events, dependent: :destroy_async'
good = 'has_many :checklist_routines, dependent: :destroy_async\n  has_many :checklist_completion_events, dependent: :destroy_async'
if bad in text:
    text = text.replace(bad, good)
elif 'checklist_completion_events' not in text:
    text = text.replace(
        'has_many :checklist_items, dependent: :destroy_async',
        'has_many :checklist_items, dependent: :destroy_async\n'
        '  has_many :checklist_routines, dependent: :destroy_async\n'
        '  has_many :checklist_completion_events, dependent: :destroy_async',
    )
acc.write_text(text)
print('account', 'checklist_completion_events' in acc.read_text())

routes = Path('/tmp/routes-checklist.rb')
rt = routes.read_text()
if 'checklist_board' not in rt:
    old = 'resources :checklist_items, only: [:update, :destroy]'
    new = (
        old
        + '\n          resources :checklist_routines, only: [:index, :create, :update, :destroy]'
        + '\n          resource :checklist_board, only: [:show]'
        + '\n          resource :checklist_stats, only: [:show]'
    )
    if old not in rt:
        raise SystemExit('routes needle missing')
    routes.write_text(rt.replace(old, new, 1))
print('routes', 'checklist_board' in routes.read_text())
