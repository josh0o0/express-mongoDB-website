import sys 
import json

result = {
    # sys.argv[0]是python檔案路徑
    'Name': sys.argv[1],
    'From': sys.argv[2],
  }

json = json.dumps(result)

print(str(json))
sys.stdout.flush()