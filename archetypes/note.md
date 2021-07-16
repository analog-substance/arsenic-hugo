---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
author: "{{ replaceRE "(.+)-" "" .Name  }}"
hosts: [ "a" ]
---

Sweet notes
