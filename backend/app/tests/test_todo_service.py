import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.todo import Base, TaskStatus
from schemas.todo import TodoCreate, TodoClaim
from services.todo_service import TodoService

@pytest.fixture(scope="module")
def db_session():
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_create_task_sets_defaults(db_session):
    payload = TodoCreate(title="SvcTest", description=None, assignee=None)
    todo = TodoService.create_task(db_session, payload)
    assert todo.id is not None
    assert todo.status == TaskStatus.TODO
    assert todo.assignee is None

def test_get_all_tasks_returns_list(db_session):
    # ensure at least one exists
    TodoService.create_task(db_session, TodoCreate(title="ListTest", description="", assignee=None))
    all_tasks = TodoService.get_all_tasks(db_session)
    assert isinstance(all_tasks, list)
    assert any(t.title == "ListTest" for t in all_tasks)

def test_search_tasks_by_title(db_session):
    # clear and add two
    db_session.query(Base.metadata.tables['todos']).delete()
    db_session.commit()
    TodoService.create_task(db_session, TodoCreate(title="FooBar", description="", assignee=None))
    TodoService.create_task(db_session, TodoCreate(title="BazQux", description="", assignee=None))

    results = TodoService.search_tasks_by_title(db_session, "Foo")
    assert len(results) == 1
    assert results[0].title == "FooBar"

def test_claim_task_happy_path(db_session):
    # create then claim
    created = TodoService.create_task(db_session, TodoCreate(title="ClaimMe", description="", assignee=None))
    claim = TodoClaim(assignee="bob")
    updated = TodoService.claim_task(db_session, created.id, claim)
    assert updated is not None
    assert updated.status == TaskStatus.INPROGRESS
    assert updated.assignee == "bob"

def test_claim_task_nonexistent_returns_none(db_session):
    assert TodoService.claim_task(db_session, task_id=9999, data=TodoClaim(assignee="x")) is None

def test_claim_task_invalid_state_raises(db_session):
    # create and manually set to COMPLETED
    todo = TodoService.create_task(db_session, TodoCreate(title="DoneIt", description="", assignee=None))
    todo.status = TaskStatus.COMPLETED
    db_session.commit()

    with pytest.raises(ValueError):
        TodoService.claim_task(db_session, todo.id, TodoClaim(assignee="alice"))