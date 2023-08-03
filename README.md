# bt-plugin-dev

Plugin develop environment for [BT](https://bt.cn)

## Usage

Install venv:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r www/server/panel/requirements.txt
```

For PyCharm, add `class` to path, then run `test.py` in PyCharm:

* Open `PyCharm > Settings > Project > Python Interpreter` tab.
* Click the list of interpreters, then click `Show All` item.
* Choose the `venv` and click `Show Interpreter Paths` icon.
* Click `+` and add the `www/server/panel/class` to path.

For CLI, setup the `PYTHONPATH` and run `test.py` in CLI:

```bash
export PYTHONPATH=$(pwd)/www/server/panel/class
python test.py
#setup path: /www/server
```

Link srs-cloud and develop it:

```bash
ln -sf ~/git/srs-cloud/scripts/setup-bt
ln -sf ~/git/srs-cloud/scripts/setup-aapanel
```

## Docker

Build a docker image:

```bash
docker rm -f bt 2>/dev/null || echo 'OK' &&
docker rmi bt 2>/dev/null || echo 'OK' &&
docker build --progress plain -t bt -f Dockerfile .
```

Create a docker container in daemon:

```bash
docker rm -f bt 2>/dev/null || echo 'OK' &&
docker run -p 7800:7800 -v $(pwd)/example:/www/server/panel/plugin/example \
    --privileged -v /sys/fs/cgroup:/sys/fs/cgroup:rw --cgroupns=host \
    -d --rm -it -v $(pwd):/g -w /g --name=bt bt
```

Open [http://localhost:7800/srscloud](http://localhost:7800/srscloud) and login:

* Username: `ossrs`
* Password: `12345678`

> Note: Or you can use `docker exec -it bt bt default` to show the login info.

Register a BT account and bind to the container, in the application store, there is a example plugin.

