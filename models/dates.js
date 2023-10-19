//objetos de fechas
const day=new Array(31);
for(var i=1; i<=31; i++) day[i-1]=i;
const month=new Array(12);
for(var i=1; i<=12; i++) month[i-1]=i;
const months=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const year=[];
var n=0;
var yearNow=Date.now();
var date=new Date(yearNow);
for(var i=1950; i<=date.getFullYear()+10; i++) {
    year[n]=i;
    n++;
}

const dates={
    Day:day,
    Month:month,
    Months:months,
    Year:year
}

module.exports=dates;