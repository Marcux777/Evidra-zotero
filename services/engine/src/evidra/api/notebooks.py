from fastapi import APIRouter, Query, Request

from evidra.domain.models import Notebook, NotebookCreate, NotebookPage
from evidra.notebooks.service import NotebookService

router = APIRouter(prefix="/v1/notebooks", tags=["notebooks"])


def service(request: Request) -> NotebookService:
    result: NotebookService = request.app.state.services.notebooks
    return result


@router.post("", response_model=Notebook, status_code=201)
def create_notebook(body: NotebookCreate, request: Request) -> Notebook:
    return service(request).create(body)


@router.get("", response_model=NotebookPage)
def list_notebooks(
    request: Request, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=100)
) -> NotebookPage:
    return service(request).list(offset, limit)


@router.get("/{notebook_id}", response_model=Notebook)
def get_notebook(notebook_id: str, request: Request) -> Notebook:
    return service(request).get(notebook_id)
