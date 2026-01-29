class _ForgetfulDict(dict):
    """A dictionary that discards any items set on it. For use as `memo` in
    `copy.deepcopy()` when every instance of a repeated object in the deepcopied
    data structure should result in a separate copy.
    """

    def __setitem__(self, key, value):
        pass


import copy


class T:
    pass


a = T()
b = T()
original_list = [a, a, b]

print(f"{id(original_list)=}")
print(f"{id(original_list[0])=}")
print(f"{id(original_list[1])=}")
print(f"{id(original_list[2])=}")
memo_normal = {}

copied_list_normal = copy.deepcopy(original_list, memo_normal)

print("\n\n")
print(f"{id(copied_list_normal)=}")
print(f"{id(copied_list_normal[0])=}")
print(f"{id(copied_list_normal[1])=}")
print(f"{id(copied_list_normal[2])=}")
from pprint import pprint

print("memo_normal=")
pprint(memo_normal)

memo_forgetful = _ForgetfulDict()
copied_list_forgetful = copy.deepcopy(original_list, memo_forgetful)
print("\n\n")
print(f"{id(copied_list_forgetful)=}")
print(f"{id(copied_list_forgetful[0])=}")
print(f"{id(copied_list_forgetful[1])=}")
print(f"{id(copied_list_forgetful[2])=}")
print(f"{memo_forgetful=}")

print(f"{copied_list_forgetful[0] is copied_list_forgetful[1]}")

print(f"{copied_list_normal[0] is copied_list_normal[1]}")


import sys

sys.setrecursionlimit(100)

recursive_list = [1, 2]
recursive_list.append(recursive_list)

copied_list = copy.deepcopy(recursive_list)
print(f"{ copied_list =}")
