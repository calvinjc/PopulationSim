#Population Sim 

This is a simple population simulator I threw together to determine how quickly a population could grow in a certain period of time based on a set of customizable variables.  The underlying curiosity that triggered this was wondering just how quickly humans can reproduce. Questions like: "How quickly could the earth repopulate after a doomsday event?" Or "How many offspring could one family have after a couple hundred years?"  This was my attempt at getting a rough answer (even if it is based on an ideal world), and the answer is *Suprisingly Quickly*.

The trick was to find a way to do it that would be performant in a web browser.  As you can imagine tracking any kind of data on an individual level becomes very computationally intensive when you start dealing with large populations.  So I had to make generalizations, the biggest one being that (based on the settings) all women would have the same number of children, at the same rate, at the same years of their lives.  For example if the birth rate is set to 3 years, number of children: 3, age of first child 24, then all women will have children at the age of 24, 27 and 30.  Everyone will also die at the same age.  This isn't all that bad though, because when you consider the numbers to be an average, you should get roughly the same results as you would with variance in a large enough simulation.  However it does restrict the inputs to round numbers (you can't say each couple will have 2.5 kids) which limits the flexibility of the inputs. It also makes for some interesting graphs. 

These generalizations make it very easy to performantly make the calculations because everything happens at the same time.  I track the population in a JavaScript array where the index of the array is the age of that segment of the population.  Since everyone dies at the same time the length of the array stays the same after every sim year.  Each year I insert an element at the beginning of the array with the number of babies born that year, and remove the last element in the array which represents the number of people who died that year.  I'm taking advantage of JavaScript's flex The sum of the elements of the array is the total population during that year.  Since there is no distinguishing men and women in the population, I assume that half the people born during any year are women.  When there is an odd number of people I use a toggle to ensure that an equal number of men and women are being considered.  

The first enhancement I want to add is variance for the starting age of the population instead of forcing the starting population to all be the same age.  This is fine simulating 2 people but is odd for larger populations.  I am also considering an enhancement to split the men and women into two different arrays so they can be tracked separately.  This would allow tracking inputs such as the rate of women who die in childbirth.
