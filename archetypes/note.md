---
title: "{{ replaceRE "__(.+)" "" .Name | title }}"
date: {{ .Date }}
author: "{{ replaceRE "(.+)__" "" .Name  }}"
hosts: [ "{{ .Site.Name }}" ]
---

Sweet notes
