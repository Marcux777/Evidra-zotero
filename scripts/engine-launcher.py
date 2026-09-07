"""Frozen entry point: dispatch multiprocessing helpers before starting the bridge CLI."""

import multiprocessing

if __name__ == "__main__":
    multiprocessing.freeze_support()
    import sys

    if sys.argv[1:] == ["--parser-worker"]:
        from evidra.documents.parser_worker import worker_main

        worker_main()
    else:
        from evidra.__main__ import main

        main()
