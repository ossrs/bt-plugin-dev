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

* Open `PyCharm > Settings > Project > Python Interpreter`
* Click the list of interpreters, then click `Show All`
* Choose the `venv` and click `Show Interpreter Paths`
* Click `+` and add the `www/server/panel/class` to path.

For CLI, setup the `PYTHONPATH` and run `test.py` in CLI:

```bash
export PYTHONPATH=$(pwd)/www/server/panel/class
python test.py
#setup path: /www/server
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
docker run -p 7800:7800 --privileged -v /sys/fs/cgroup:/sys/fs/cgroup:rw --cgroupns=host \
    -d --rm -it -v $(pwd):/g -w /g --name=bt bt
```

Open [http://localhost:7800/srscloud](http://localhost:7800/srscloud) and login:

* Username: `ossrs`
* Password: `12345678`

> Note: Or you can use `docker exec -it bt bt default` to show the login info.
