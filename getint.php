<?php
	//Create a variable to be used in 
	$theVar = array('customInt' => 5);

	//Set the headers
	header('Content-Type: application/json');

	//Encode the variable, and save the encoded string
	$encoded = json_encode($theVar);

	//Output it
	echo $encoded;
?>
