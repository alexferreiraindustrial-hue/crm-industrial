class ChecklistItemPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    true
  end

  def update?
    own_item?
  end

  def destroy?
    own_item?
  end

  private

  def own_item?
    record.user_id == user.id
  end
end
