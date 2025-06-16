import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models.todo import Base
from models.todo import Todo, TaskStatus
from repositories.todo import TodoRepository

@pytest.fixture(scope="module")
def db_session():
    # In-memory SQLite for fast tests
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_save_and_get_by_id(db_session):
    # create and persist a Todo
    t = Todo(title="RepoTest", description="desc", assignee=None, status=TaskStatus.TODO)
    saved = TodoRepository.save(db_session, t)
    assert saved.id is not None

    # retrieve it
    fetched = TodoRepository.get_by_id(db_session, saved.id)
    assert fetched is not None
    assert fetched.id == saved.id
    assert fetched.title == "RepoTest"

def test_get_by_id_nonexistent_returns_none(db_session):
    assert TodoRepository.get_by_id(db_session, task_id=9999) is None

def test_search_by_title(db_session):
    # clear existing for idempotency
    db_session.query(Todo).delete()
    db_session.commit()

    # add two
    TodoRepository.save(db_session, Todo(title="apple pie", description="", status=TaskStatus.TODO))
    TodoRepository.save(db_session, Todo(title="banana split", description="", status=TaskStatus.TODO))

    results = TodoRepository.search_by_title(db_session, "apple")
    assert len(results) == 1
    assert results[0].title.lower().startswith("apple")

def test_update_assignee_and_status(db_session):
    # add one
    t = TodoRepository.save(db_session, Todo(title="UpTest", description="", status=TaskStatus.TODO))
    # update it
    updated = TodoRepository.update_assignee_and_status(
        db_session, t.id, assignee="alice", status=TaskStatus.INPROGRESS
    )
    assert updated is not None
    assert updated.assignee == "alice"
    assert updated.status == TaskStatus.INPROGRESS

def test_update_assignee_and_status_nonexistent(db_session):
    # updating a missing ID returns None
    assert TodoRepository.update_assignee_and_status(
        db_session, task_id=1234, assignee="x", status=TaskStatus.TODO
    ) is None