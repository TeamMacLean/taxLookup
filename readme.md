Tax Lookup
> NCBI Taxonomy tools

```
Tax.spell('human')
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.error(err);
    });

Tax.search('human')
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.error(err);
    });
```